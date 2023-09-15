import makeWASocket, {
	Browsers,
	delay,
	DisconnectReason,
	fetchLatestBaileysVersion,
	MessageRetryMap,
	useMultiFileAuthState,
} from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import {
	readdir,
	rmSync,
} from 'fs'
import { join } from 'path'
import pino from 'pino'
import { toDataURL } from 'qrcode'
import response from './response'
import WLRedis from './Models/WLRedis'
import WLWebhook from './Models/WLWebhook'
import Helper from './helper/Helper'
// External map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const sessions = new Map()

const sessionsDir = (sessionId = '') => {
	return join('sessions', sessionId ? (sessionId.startsWith('md_') ? sessionId : sessionId + '.json') : '')
}

let Redis = new WLRedis();
let Webhook = new WLWebhook();
let WLHelper = new Helper();
const msgRetryCounterMap: MessageRetryMap = {}

const getSession = (sessionId) => {
	return sessions.get(sessionId) ?? null
}

const init = () => {
	readdir(sessionsDir(), (err, files) => {
		for (const file of files) {
			if (file.startsWith('md_')) {
				let sessionId = file.replace('md_', '');
				createSession(sessionId)
			}
		}
	})
}


const deleteSession = (sessionId, clearInstance = false) => {
	const sessionFile = 'md_' + sessionId;
	const rmOptions = { force: true, recursive: true }

	rmSync(sessionsDir(sessionFile), rmOptions);

	sessions.delete(sessionId)
}


const createSession = async (sessionId, res = null) => {
	try {
		const sessionFile = 'md_' + sessionId

		const logger = pino({ level: 'error' }, pino.destination("./pino-logger.log"));
		// Save every 10s
		const { state, saveCreds } = await useMultiFileAuthState(sessionsDir(sessionFile))

		// Fetch latest version of WA Web
		const { version } = await fetchLatestBaileysVersion()
		let browser;
		browser = Browsers.appropriate('safari');

		const sock = makeWASocket({
			version,
			logger,
			printQRInTerminal: false,
			markOnlineOnConnect: true,
			auth: state,
			browser: Browsers.macOS('Desktop'),
			syncFullHistory: true,
			msgRetryCounterMap,
			getMessage: async key => {
				(process.env.DEBUG_MODE == 'true') ? console.log('getMessage Problem :', key) : '';
				const msg = await Redis.getMessage(sessionId, key.id);
				if (msg) {
    				(process.env.DEBUG_MODE == 'true') ? console.log('getMessage Problem Fixed  Message is :', msg.body) : '';
					return {
						conversation: msg.body
					}
				}
				// only if store is present
				return {
					conversation: '  '
				}
			}
		})

		sessions.set(sessionId, { ...sock })
		sock.ev.process(
			// events is a map for event name => event data
			async (events) => {
				// something about the connection changed
				// maybe it closed, or we received all offline message or connection opened
				if (events['connection.update']) {
					const update = events['connection.update'];
					const { connection, lastDisconnect } = update;
					try {
						if (connection === 'close') {
							if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
								createSession(sessionId, res);
							} else {
								await Webhook.appLogOut(sessionId);
								deleteSession(sessionId, true)
							}
						}
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('update data : ', update) : '';
						(process.env.DEBUG_MODE == 'true') ? console.log('connection.update error', e) : '';
					}
					try {
						if (update.qr && update.qr !== 'undefined' && res && res !== null) {
							if (res !== null) {
								const qr = await toDataURL(update.qr)
								response(res, 200, true, 'QR code received, please scan the QR code.', { qr })
							}
						}
					} catch (e) {
						// (process.env.DEBUG_MODE == 'true') ? console.log('Get QR Error : ', e) : '';
					}
				}

				// credentials updated -- save them
				if (events['creds.update']) {
					try {
						await saveCreds()
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('creds.update error', e) : '';
					}
				}

				if (events.call) {
					// console.log('recv call event', events.call)
				}

				// chat history received
				if (events['chats.set']) {
					const { chats } = events['chats.set']
					try {
						await Redis.setChats(sessionId, chats);
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('chats.set error', e) : '';
					}
				}

				// message history received
				if (events['messages.set']) {
					const { messages } = events['messages.set']
					try {
						await Redis.setMessages(sessionId, messages, sock);
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('messages.set error', e) : '';
					}
				}

				if (events['contacts.set']) {
					const { contacts } = events['contacts.set']
					try {
						await Redis.setContacts(sessionId, contacts);
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('contacts.set error', e) : '';
					}
				}

				if (events['contacts.upsert']) {
					try {
						await Redis.setContacts(sessionId, events['contacts.upsert']);
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('contacts.upsert error', e) : '';
					}
				}
				if (events['contacts.update']) {
					try {
						await Redis.setContacts(sessionId, events['contacts.update']);
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('contacts.update error', e) : '';
					}
				}

				// received a new message
				if (events['messages.upsert']) {
					const m = events['messages.upsert']
					try {
						const msg = m.messages[0]
						if (!msg.message) {
							return
						} // If there is no text or media message
						const messageType = Object.keys(msg.message)[0] // Get what type of message it is -- text, image, video
						if (msg.key.remoteJid !== 'status@broadcast' && messageType != 'protocolMessage') {
							const messageObj = await WLHelper.reformatMessageObj(sessionId, msg, messageType, sock)
							const msgObjWebhook = messageObj
							if (messageObj && msgObjWebhook) {
								msgObjWebhook.status = messageObj.status - 1;
								// await delay(3000);
								await Webhook.MessageUpsert(sessionId, msgObjWebhook);
							}
						}
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('error on upsert Message: ', m.messages[0]) : '';
						(process.env.DEBUG_MODE == 'true') ? console.log('error on upsert', e.message) : '';
					}
				}

				// messages updated like status delivered, message deleted etc.
				if (events['messages.update']) {
					const m = events['messages.update'];
					try {
						(m[0].key.remoteJid !== 'status@broadcast') ? await Webhook.MessageUpdates(sessionId, m) : '';
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('messages.update error', e) : '';
					}
				}

				if (events['message-receipt.update']) {
					// console.log(events['message-receipt.update'])
				}

				if (events['messages.reaction']) {
					// console.log(events['messages.reaction'])
				}

				if (events['presence.update']) {
					// console.log(events['presence.update'])
				}
				// Dialog Last Time updates
				if (events['chats.update']) {
					const m = events['chats.update'];
					try {
						(m[0].id !== 'status@broadcast') ? await Webhook.ChatsUpdate(sessionId, m) : '';
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('chats.update error', e) : '';
					}
				}
				// TODO: Not Working
				if (events['chats.delete']) {
					const m = events['chats.delete']
					try {
						await Webhook.ChatsDelete(sessionId, m);
					} catch (e) {
						(process.env.DEBUG_MODE == 'true') ? console.log('chats.delete error', e) : '';
					}
				}
			}
		)
		// TODO: Send when any message or any action doing in whatsapp
		sock.ws.on('CB:iq,,pair-success', async (stanza) => {
			try {
				await Webhook.connectionConnected(sessionId);
			} catch (e) {
				(process.env.DEBUG_MODE == 'true') ? console.log('CB:iq,,pair-success error', e) : '';
			}
		})
	} catch (error) {
		console.log("createSession : " + error);
	}
}

export {
	createSession,
	getSession,
	deleteSession,
	init,
}