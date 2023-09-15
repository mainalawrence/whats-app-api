import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from '../Middleware/requestValidator'
import sessionValidator from '../Middleware/sessionValidator'
import Message from '../Models/Message'
// import getMessages from '../controllers/getMessages';
const router = Router()

router.get('/get', query('id').notEmpty(), requestValidator, sessionValidator, (req, res) => new Message(req, res).getList(req, res))
router.get('/fetchDialogs', query('id').notEmpty(), requestValidator, sessionValidator, (req, res) => new Message(req, res).fetchDialogs(req, res))
router.get('/fetchMessages', query('id').notEmpty(), requestValidator, sessionValidator, (req, res) => new Message(req, res).fetchMessages(req, res))
router.post('/getMessageByID', query('id').notEmpty(), body('messageId').notEmpty(), requestValidator, sessionValidator, (req, res) => new Message(req, res).findMessage(req, res))
// router.get('/get/:jid', query('id').notEmpty(), requestValidator, sessionValidator, getMessages)
router.post(
    '/sendMessage',
    query('id').notEmpty(), //when passing a message we dont need the query
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('body').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).send(req, res)
)

router.post(
    '/sendDisappearingMessage',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('body').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendDisappearing(req, res)
)

router.post(
    '/sendButtons',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('body').notEmpty(),
    body('footer').notEmpty(),
    body('buttons').notEmpty(),
    body('hasImage').notEmpty(),
    body('imageURL'),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendButtons(req, res)
)
router.post(
    '/sendButtonsTemplate',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('body').notEmpty(),
    body('footer').notEmpty(),
    body('buttons').notEmpty(),
    body('hasImage').notEmpty(),
    body('imageURL'),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendTemplates(req, res)
)

router.post(
    '/sendListMessage',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('body').notEmpty(),
    body('footer').notEmpty(),
    body('sections').notEmpty(),
    body('title').notEmpty(),
    body('buttonText').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendListMessage(req, res)
)

router.post(
    '/sendReaction',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('body').notEmpty(),
    body('messageId').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendReaction(req, res)
)

router.post(
    '/sendReply',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('body').notEmpty(),
    body('quoted').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendReply(req, res)
)

router.post(
    '/sendMention',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('mention').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendMention(req, res)
)

router.post(
    '/sendLocation',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('lat').notEmpty(),
    body('lng').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendLocation(req, res)
)

router.post(
    '/sendContact',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('name').notEmpty(),
    body('contact').notEmpty(),
    body('organization'),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendContact(req, res)
)

router.post(
    '/forwardMessage',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('msg').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).forwardMessage(req, res)
)

router.post(
    '/checkPhone',
    query('id').notEmpty(),
    body('receiver').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).checkPhone(req, res)
)

router.post(
    '/deleteMessage',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('messageKey').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).deleteMessage(req, res)
)

router.post(
    '/deleteMessageForMe',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('messageKey').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).deleteMessageForMe(req, res)
)

router.post(
    '/sendAudio',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('url').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendAudio(req, res)
)

router.post(
    '/sendPTT',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('url').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendPTT(req, res)
)

router.post(
    '/sendVideo',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('url').notEmpty(),
    body('caption'),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendVideo(req, res)
)

router.post(
    '/sendFile',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('url').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendFile(req, res)
)

router.post(
    '/sendImage',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('url').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendImage(req, res)
)

router.post(
    '/sendStiker',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('url').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendStiker(req, res)
)

router.post(
    '/sendGif',
    query('id').notEmpty(),
    body('phone'),
    body('chat').if(body('phone').not().exists()).notEmpty(),
    body('url').notEmpty(),
    body('caption'),
    requestValidator,
    sessionValidator,
    (req, res) => new Message(req, res).sendGif(req, res)
)

export default router
