import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from '../Middleware/requestValidator'
import sessionValidator from '../Middleware/sessionValidator'
import Chats from '../Models/Chats'

const router = Router()

router.get('/', query('id').notEmpty(), requestValidator, sessionValidator, (req, res) => new Chats().getList(req, res))

router.get('/:jid', query('id').notEmpty(), requestValidator, sessionValidator, (req, res) => new Chats().getChat(req, res))

router.get('/meta/:jid', query('id').notEmpty(), requestValidator, sessionValidator, (req, res) => new Chats().getGroupMetaData(req, res))

router.post(
    '/sendMessage',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('message').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().send(req, res)
)

router.post(
    '/readChat',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().readChat(req, res)
)

router.post(
    '/unreadChat',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().unreadChat(req, res)
)

router.post(
    '/archiveChat',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().archiveChat(req, res)
)

router.post(
    '/unarchiveChat',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().unarchiveChat(req, res)
)

router.post(
    '/muteChat',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('duration').isInt().notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().muteChat(req, res)
)

router.post(
    '/unmuteChat',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().unmuteChat(req, res)
)

router.post(
    '/pinChat',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().pinChat(req, res)
)

router.post(
    '/unpinChat',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().unpinChat(req, res)
)

router.post(
    '/displayPicture',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().chatDisplayPicture(req, res)
)

router.post(
    '/setDisplayPicture',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    body('imageURL').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().setDisplayPicture(req, res)
)

router.post(
    '/group',
    query('id').notEmpty(),
    body('subject').notEmpty(),
    body('phones').isArray({ min: 1 }).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().createGroup(req, res)
)

router.post(
    '/groupSettings',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    body('settings').isIn(['announcement', 'not_announcement', 'locked', 'unlocked']).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().groupSettings(req, res)
)

router.post(
    '/renameGroup',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    body('subject').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().renameGroup(req, res)
)

router.post(
    '/setGroupDescription',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    body('description').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().setGroupDescription(req, res)
)

router.post(
    '/leaveGroup',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    body('description').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().leaveGroup(req, res)
)

router.post(
    '/addGroupParticipant',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    body('phones').isArray({ min: 1 }).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().addGroupParticipant(req, res)
)

router.post(
    '/removeGroupParticipant',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    body('phones').isArray({ min: 1 }).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().removeGroupParticipant(req, res)
)

router.post(
    '/promoteGroupParticipant',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    body('phones').isArray({ min: 1 }).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().promoteGroupParticipant(req, res)
)

router.post(
    '/demoteGroupParticipant',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    body('phones').isArray({ min: 1 }).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().demoteGroupParticipant(req, res)
)

router.post(
    '/typing',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().setTyping(req, res)
)

router.post(
    '/recording',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().setRecording(req, res)
)

router.post(
    '/inviteCode',
    query('id').notEmpty(),
    body('chat').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().inviteCode(req, res)
)

router.post(
    '/joinGroup',
    query('id').notEmpty(),
    body('code').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().joinGroup(req, res)
)

router.post(
    '/clearChat',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Chats().clearChat(req, res)
)

export default router
