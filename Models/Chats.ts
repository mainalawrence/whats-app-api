import Helper from "../helper/Helper";
import WLContactInterface from "../interfaces/WLContactInterface";
import { getSession } from "../whatsapp";
import WLRedis from './WLRedis';

export default class Chats extends Helper {

    private Redis = new WLRedis();

    async getChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const { jid } = req.params
        const { limit = 25, cursor_id = null, cursor_fromMe = null } = req.query

        const cursor = {
            before: {}
        }
        if (cursor_id) {
            cursor.before = {
                id: cursor_id,
                fromMe: Boolean(cursor_fromMe && cursor_fromMe === 'true'),
            }
        }

        try {
            let messages
            const useCursor = 'before' in cursor ? cursor : null

            messages = await session.fetchMessagesFromWA(jid, limit, useCursor)

            this.response(res, 200, true, '', messages)
        } catch (error) {
            this.response(res, 500, false, 'Failed to load messages : ' + error)
        }

    }

    async getList(req, res) {
        try {
            let contacts: WLContactInterface[] = await this.Redis.getContacts(res.locals.sessionId);
            let dialogsArr: WLContactInterface[] = []
            await Promise.all(Object.values(contacts).map(async (contact) => {
                try {
                    contact.image = await getSession(res.locals.sessionId).profilePictureUrl(contact.id)
                } catch (e) {
                    (process.env.DEBUG_MODE == 'true') ? console.log('fetching chat image error', contact.id) : '';
                }
                dialogsArr.push(contact)
            }));
            this.response(res, 200, true, 'Dialogs Found !!!', dialogsArr)
        } catch (e) {
            this.response(res, 500, false, 'Failed to load Dialogs.')
        }
    }

    async getGroupMetaData(req, res) {
        const session = getSession(res.locals.sessionId)
        const { jid } = req.params

        try {
            const data = await session.groupMetadata(jid)

            if (!data.id) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            this.response(res, 200, true, '', data)
        } catch {
            this.response(res, 500, false, 'Failed to get group metadata.')
        }
    }

    async send(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)
        const { message } = req.body

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))
            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }
            await session.sendMessage(session, target, { text: message })

            this.response(res, 200, true, 'The message has been successfully sent.')
        } catch {
            this.response(res, 500, false, 'Failed to send the message.')
        }
    }

    // TODO: Add Test Unit To This Function
    async readChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)
        return this.response(res, 200, true, '')
        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const lastMsgInChat = await this.Redis.getLastMessageInChat(res.locals.sessionId, target)
            const status = await session.chatModify({ markRead: true, lastMessages: [lastMsgInChat] }, target)

            return this.response(res, 200, true, '', status)
        } catch (error) {
            return this.response(res, 500, false, 'Failed to read chat. ' + error)
        }
    }
    // TODO: Add Test Unit To This Function
    async unreadChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)
        return this.response(res, 200, true, '')
        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }
            const lastMsgInChat = await this.Redis.getLastMessageInChat(res.locals.sessionId, target)
            const status = await session.chatModify({ markRead: false, lastMessages: [lastMsgInChat] }, target)
            return this.response(res, 200, true, '', status)
        } catch (error) {
            return this.response(res, 500, false, 'Failed to unread chat : ' + error)
        }
    }


    async archiveChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }
            const lastMsgInChat = await this.Redis.getLastMessageInChat(res.locals.sessionId, target)
            const status = await session.chatModify({ archive: true, lastMessages: [lastMsgInChat] }, target)
            return this.response(res, 200, true, '', status)
        } catch (error) {
            return this.response(res, 500, false, 'Failed to archive chat : ' + error)
        }
    }

    async unarchiveChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }
            const lastMsgInChat = await this.Redis.getLastMessageInChat(res.locals.sessionId, target)
            const status = await session.chatModify({ archive: false, lastMessages: [lastMsgInChat] }, target)
            return this.response(res, 200, true, '', status)
        } catch (error) {
            return this.response(res, 500, false, 'Failed to unarchive chat : ' + error)
        }
    }

    async muteChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)
        const { duration } = req.body

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.chatModify({ mute: duration }, target, [])

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to mute chat.')
        }
    }

    async unmuteChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.chatModify({ mute: null }, target, [])

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to unmute chat.')
        }
    }

    async pinChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.chatModify({ pin: true }, target, [])

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to pin chat.')
        }
    }

    async unpinChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.chatModify({ pin: false }, target, [])

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to unpin chat.')
        }
    }

    async chatDisplayPicture(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const image = await session.profilePictureUrl(chat, 'image')

            return this.response(res, 200, true, '', image)
        } catch {
            return this.response(res, 500, false, 'Failed to get chat display picture.')
        }
    }

    async setDisplayPicture(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)
        const { imageURL } = req.body

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const updated = await session.updateProfilePicture(chat, { url: imageURL })

            if (updated) {
                return this.response(res, 200, true, '')
            }

            return this.response(res, 500, false, 'Failed to set group display picture.')
        } catch {
            return this.response(res, 500, false, 'Failed to set group display picture.')
        }
    }

    async createGroup(req, res) {
        const session = getSession(res.locals.sessionId)
        const { subject, phones } = req.body

        try {
            const group = await session.groupCreate(subject, phones)

            return this.response(res, 200, true, '', {
                id: group.id,
                gid: group.gid,
            })
        } catch {
            return this.response(res, 500, false, 'Failed to get chat display picture.')
        }
    }

    async groupSettings(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)
        const { setting } = req.body

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const group = await session.groupSettingUpdate(chat, setting)

            return this.response(res, 200, true, '', {
                id: group.id,
                gid: group.gid,
            })
        } catch {
            return this.response(res, 500, false, 'Failed to get chat display picture.')
        }
    }

    async renameGroup(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)
        const { subject } = req.body

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.groupUpdateSubject(chat, subject)

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to rename group.')
        }
    }

    async setGroupDescription(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)
        const { description } = req.body

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.groupUpdateDescription(chat, description)

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to change group description.')
        }
    }

    async leaveGroup(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.groupLeave(chat)

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to leave group.')
        }
    }

    async addGroupParticipant(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)
        const { phones } = req.body

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.groupParticipantsUpdate(chat, phones, 'add')

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to add group participants.')
        }
    }

    async removeGroupParticipant(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)
        const { phones } = req.body

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.groupParticipantsUpdate(chat, phones, 'remove')

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to remove group participants.')
        }
    }

    async promoteGroupParticipant(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)
        const { phones } = req.body

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.groupParticipantsUpdate(chat, phones, 'promote')

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to promote group participants.')
        }
    }

    async demoteGroupParticipant(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatGroup(req.body.chat)
        const { phones } = req.body

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.groupParticipantsUpdate(chat, phones, 'demote')

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to demote group participants.')
        }
    }

    async setTyping(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const updated = await session.sendPresenceUpdate(target, 'composing')

            return this.response(res, 200, true, '', updated)
        } catch {
            return this.response(res, 500, false, 'Failed to set user presence.')
        }
    }

    async setRecording(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const updated = await session.sendPresenceUpdate(target, 'recording')

            return this.response(res, 200, true, '', updated)
        } catch {
            return this.response(res, 500, false, 'Failed to set user presence.')
        }
    }

    async inviteCode(req, res) {
        const session = getSession(res.locals.sessionId)
        const chat = this.formatPhone(req.body.chat)

        try {
            const exists = await this.isExists(session, chat, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const code = await session.groupInviteCode(chat)

            return this.response(res, 200, true, '', code)
        } catch {
            return this.response(res, 500, false, 'Failed to get group invitation link.')
        }
    }

    async joinGroup(req, res) {
        const session = getSession(res.locals.sessionId)
        const { code } = req.body

        try {
            const response = await session.groupAcceptInvite(code)

            return this.response(res, 200, true, '', this.response)
        } catch {
            return this.response(res, 500, false, 'Failed to get group invitation link.')
        }
    }

    async clearChat(req, res) {
        const session = getSession(res.locals.sessionId)
        const target = req.body.phone ? this.formatPhone(req.body.phone) : this.formatGroup(req.body.chat)

        try {
            const exists = await this.isExists(session, target, (!req.body.phone ? true : false))

            if (!exists) {
                return this.response(res, 400, false, 'This chat does not exist.')
            }

            const status = await session.chatModify({ clear: 'all' }, target, [])

            return this.response(res, 200, true, '', status)
        } catch {
            return this.response(res, 500, false, 'Failed to clear chat.')
        }
    }

}