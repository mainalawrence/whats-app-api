import Redis from 'ioredis';
import JSONCache from 'redis-json';
import Helper from '../helper/Helper';
import WLContactInterface from '../interfaces/WLContactInterface';
import WLConversationInterface from '../interfaces/WLConversationInterface';
import WLMessageInterface from '../interfaces/WLMessageInterface';

export default class WLRedis extends Helper {
    private redis;
    constructor() {
        super();
        this.redis = new Redis({
            port: 6379, // Redis port
            host: "127.0.0.1", // Redis host
            // username: "default", // needs Redis >= 6
            // password: "my-top-secret",
            // db: 0, // Defaults to 0
        })
    }
    // Set One
    async setContact(session_id, contact) {
        const jsonCache = new JSONCache<typeof contact[0]>(this.redis, { prefix: `${session_id}:contacts:` });
        jsonCache.set(contact.id, contact);
        (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis setContact') : '';
    }

    async setChat(session_id, chat) {
        const jsonCache = new JSONCache<typeof chat[0]>(this.redis, { prefix: `${session_id}:chats:` });
        jsonCache.set(chat.id, chat);
        (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis setChat') : '';
    }

    async setMessage(session_id, message) {
        const jsonCache = new JSONCache<typeof message>(this.redis, { prefix: `${session_id}:messages:` });
        jsonCache.set(message.id, message);
        (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis setMessage') : '';
    }

    // Set Array

    async setContacts(session_id, contacts) {
        const jsonCache = new JSONCache<typeof contacts[0]>(this.redis, { prefix: `${session_id}:contacts:` });
        contacts.forEach(element => {
            jsonCache.set(element.id, element)
        });
        (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis setContacts') : '';
    }

    async setChats(session_id, chats) {
        const jsonCache = new JSONCache<typeof chats[0]>(this.redis, { prefix: `${session_id}:chats:` });
        chats.forEach(element => {
            jsonCache.set(element.id, element)
        });
        (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis setChats') : '';
    }

    async setMessages(session_id, messages, sock) {
        const jsonCache = new JSONCache<typeof messages[0]>(this.redis, { prefix: `${session_id}:messages:` });
        try {
            if (messages && messages !== "undefined" && messages !== null) {
                messages.forEach(async (element) => {
                    if (element.message && element.message !== "undefined" && element.message !== null) {
                        const messageType = Object.keys(element.message)[0] // Get what type of message it is -- text, image, video
                        if (messageType != 'protocolMessage') {
                            element = await this.reformatMessageObj(session_id, element, messageType, sock);
                            await jsonCache.set(element.id, element)
                        }
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }

        (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis setMessages') : '';
    }

    async deleteSession(session_id) {
        const jsonCache = new JSONCache(this.redis, { prefix: `${session_id}:` });
        jsonCache.clearAll();
        (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis deleteSession') : '';
    }

    // get all  
    private async getKeys(session_id, key) {
        let returned_keys: string[] = [];
        try {
            let keys = await this.redis.keys(`${session_id}:${key}:*`);
            keys.forEach((element: string) => {
                if (!element.endsWith("_t")) {
                    returned_keys.push(element);
                }
            });
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis getKeys" + error) : '';
        }
        return returned_keys;
    }

    async getContacts(session_id) {
        let contacts: WLContactInterface[] = [];
        try {
            const keys = await this.getKeys(session_id, 'contacts');
            await Promise.all(Object.values(keys).map(async (element) => {
                contacts.push(await this.redis.hgetall(element));
            }));
            (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis getContacts') : '';
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis getContacts" + error) : '';
        }
        return contacts;
    }

    async getMessages(session_id) {
        let messages: WLMessageInterface[] = [];
        try {
            const keys = await this.getKeys(session_id, 'messages');
            await Promise.all(Object.values(keys).map(async (element) => {
                messages.push(await this.redis.hgetall(element));
            }));
            (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis getMessages') : '';
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis getMessages" + error) : '';
        }
        return messages;
    }

    async getChats(session_id) {
        let chats: WLConversationInterface[] = [];
        try {
            const keys = await this.getKeys(session_id, 'chats');
            await Promise.all(Object.values(keys).map(async (element) => {
                chats.push(await this.redis.hgetall(element));
            }));
            (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis getChats') : '';
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis getChats" + error) : '';
        }
        return chats;
    }
    // get one
    async getContact(session_id, message_id) {
        try {
            let contact = await this.redis.hgetall(`${session_id}:contacts:${message_id}`);
            (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis getContact') : '';
            return contact;
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis getContact" + error) : '';
        }
    }

    async getMessage(session_id, message_id) {
        try {
            let message = await this.redis.hgetall(`${session_id}:messages:${message_id}`);
            (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis getMessage') : '';
            return message;
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis getMessage" + error) : '';
        }
    }

    async getChat(session_id, message_id) {
        try {
            let chat = await this.redis.hgetall(`${session_id}:chats:${message_id}`);
            (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis getChat') : '';
            return chat;
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis getChat" + error) : '';
        }
    }
    async getLastMessageInChat(session_id, chatId) {
        let all_messages = await this.getMessages(session_id);
        let message;
        let time = 0;
        await Promise.all(Object.values(all_messages).map(async (element) => {
            if (element.remoteJid == chatId && element.fromMe == 'false' && parseInt(element.time) >= time) {
                time = parseInt(element.time);
                message = element;
            }
        }));
        return {
            key: {
                remoteJid: message.remoteJid,
                fromMe: 'false',
                id: message.id,
                participant: undefined
            },
            messageTimestamp: message.time,
        }
    }
    // Update One

    async updateContact(session_id, message_id) {
        try {
            let contact = await this.redis.hgetall(`${session_id}:contacts:${message_id}`);
            (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis updateContact') : '';
            return contact;
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis updateContact" + error) : '';
        }
    }

    async updateMessage(session_id, message_id) {
        try {
            let message = await this.redis.hgetall(`${session_id}:messages:${message_id}`);
            (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis updateMessage') : '';
            return message;
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis updateMessage" + error) : '';
        }
    }

    async updateChat(session_id, message_id) {
        try {
            let chat = await this.redis.hgetall(`${session_id}:chats:${message_id}`);
            (process.env.DEBUG_MODE == 'true') ? console.log('WLRedis updateChat') : '';
            return chat;
        } catch (error) {
            (process.env.DEBUG_MODE == 'true') ? console.log("WLRedis updateChat" + error) : '';
        }
    }
}
