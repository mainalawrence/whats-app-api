import needle from 'needle';
import * as dotenv from 'dotenv';
import Helper from '../helper/Helper';
import WLRedis from './WLRedis';

export default class WLWebhook extends Helper {
    private needle;
    private base_url;
    private Redis;
    constructor() {
        super();
        dotenv.config();
        this.needle = needle;
        this.base_url = process.env.BACKEND_URL;
        this.Redis = new WLRedis();
    }

    async MessageUpsert(sessionId, message) {
        try {
            await this.Redis.setMessage(sessionId, message);
            await this.needle.post(
                this.base_url + '/webhooks/messages-webhook',
                {
                    conversation: {
                        id: message.remoteJid,
                        lastTime: message.time,
                        lastMessage: message,
                    },
                    sessionId,
                },
                (err, resp, body) => {
                    (process.env.DEBUG_MODE == 'true') ? console.log('WLWebhook MessageUpsert : ' + body) : '';
                }
            )
        } catch (error) {
            console.log('WLWebhook MessageUpsert : ' + error)
        }
    }

    async appLogOut(sessionId) {
        try {
            await this.needle.post(
                this.base_url + '/webhooks/messages-webhook',
                {
                    connectionStatus: {
                        type: 'removed',
                    },
                    sessionId,
                },
                (err, resp, body) => {
                    (process.env.DEBUG_MODE == 'true') ? console.log('WLWebhook appLogOut : ' + body) : '';
                }
            )
        } catch (error) {
            console.log('WLWebhook appLogOut : ' + error)
        }
    }

    async connectionConnected(sessionId) {
        try {
            await this.needle.post(
                this.base_url + '/webhooks/messages-webhook',
                {
                    connectionStatus: {
                        type: 'connected',
                    },
                    sessionId,
                },
                (err, resp, body) => {
                    (process.env.DEBUG_MODE == 'true') ? console.log('WLWebhook connectionConnected : ' + body) : '';
                }
            )
        } catch (error) {
            console.log('WLWebhook connectionConnected : ' + error)
        }
    }


    async MessageUpdates(sessionId, message) {
        try {
            message[0].key.remoteJid = this.fixRemoteJid(message[0].key.remoteJid);
            await this.needle.post(
                this.base_url + '/webhooks/messages-webhook',
                {
                    messageStatus: {
                        id: message[0].key.id,
                        status: message[0].update.status,
                        statusText: this.formatStatusText(message[0].update.status),
                        fromMe: message[0].key.fromMe,
                        chatId: message[0].key.remoteJid,
                    },
                    sessionId,
                },
                (err, resp, body) => {
                    (process.env.DEBUG_MODE == 'true') ? console.log('WLWebhook MessageUpdates : ' + body) : '';
                }
            )
            await this.Redis.updateMessage(sessionId, message);
        } catch (error) {
            console.log('WLWebhook MessageUpdates : ' + error)
        }
    }


    async ChatsUpdate(sessionId, message) {
        try {
            await this.needle.post(
                this.base_url + '/webhooks/messages-webhook',
                {
                    conversationStatus: {
                        data: message,
                    },
                    sessionId,
                },
                (err, resp, body) => {
                    (process.env.DEBUG_MODE == 'true') ? console.log('WLWebhook ChatsUpdate : ' + body) : '';
                }
            )
            this.Redis.updateChat(sessionId, message);
            // TODO: Send Updates To Redis
            // M[0]['image'] = await getSession(sessionId).profilePictureUrl(m[0].id, 'image')
            // await processRedisData(sessionId, "conversations", m[0])
            // if(('pin' in m[0]) || ('archive' in m[0])){
            //     await addDataToFile(sessionId,m[0],'chatUpdated')
            // }
        } catch (error) {
            console.log('WLWebhook ChatsUpdate : ' + error)
        }
    }

    async ChatsDelete(sessionId, m) {
        // await this.needle.post(
        //     this.base_url + '/webhooks/messages-webhook',
        //     {
        //         chatDeleted: {
        //             id: m[0].id,
        //         },
        //         sessionId,
        //     },
        //     (err, resp, body) => {
        //         console.log('connectionConnected : ' + body);
        //     }
        // )

        // TODO: Send Delete To Redis
        // await processRedisData(client, sessionId + "_conversations", {
        // 	id: m[0].id,
        // 	deleted_by: 1,
        // 	deleted_at: Math.floor(Date.now() / 1000)
        // })
        // hide undefined function
        // await addDataToFile(sessionId, m[0], 'chatDeleted')
    }
}
