"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const requestValidator_1 = __importDefault(require("../Middleware/requestValidator"));
const sessionValidator_1 = __importDefault(require("../Middleware/sessionValidator"));
const Message_1 = __importDefault(require("../Models/Message"));
// import getMessages from '../controllers/getMessages';
const router = (0, express_1.Router)();
router.get('/get', (0, express_validator_1.query)('id').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).getList(req, res));
router.get('/fetchDialogs', (0, express_validator_1.query)('id').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).fetchDialogs(req, res));
router.get('/fetchMessages', (0, express_validator_1.query)('id').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).fetchMessages(req, res));
router.post('/getMessageByID', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('messageId').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).findMessage(req, res));
// router.get('/get/:jid', query('id').notEmpty(), requestValidator, sessionValidator, getMessages)
router.post('/sendMessage', (0, express_validator_1.query)('id').notEmpty(), //when passing a message we dont need the query
(0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('body').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).send(req, res));
router.post('/sendDisappearingMessage', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('body').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendDisappearing(req, res));
router.post('/sendButtons', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('body').notEmpty(), (0, express_validator_1.body)('footer').notEmpty(), (0, express_validator_1.body)('buttons').notEmpty(), (0, express_validator_1.body)('hasImage').notEmpty(), (0, express_validator_1.body)('imageURL'), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendButtons(req, res));
router.post('/sendButtonsTemplate', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('body').notEmpty(), (0, express_validator_1.body)('footer').notEmpty(), (0, express_validator_1.body)('buttons').notEmpty(), (0, express_validator_1.body)('hasImage').notEmpty(), (0, express_validator_1.body)('imageURL'), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendTemplates(req, res));
router.post('/sendListMessage', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('body').notEmpty(), (0, express_validator_1.body)('footer').notEmpty(), (0, express_validator_1.body)('sections').notEmpty(), (0, express_validator_1.body)('title').notEmpty(), (0, express_validator_1.body)('buttonText').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendListMessage(req, res));
router.post('/sendReaction', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('body').notEmpty(), (0, express_validator_1.body)('messageId').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendReaction(req, res));
router.post('/sendReply', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('body').notEmpty(), (0, express_validator_1.body)('quoted').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendReply(req, res));
router.post('/sendMention', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('mention').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendMention(req, res));
router.post('/sendLocation', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('lat').notEmpty(), (0, express_validator_1.body)('lng').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendLocation(req, res));
router.post('/sendContact', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('name').notEmpty(), (0, express_validator_1.body)('contact').notEmpty(), (0, express_validator_1.body)('organization'), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendContact(req, res));
router.post('/forwardMessage', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('msg').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).forwardMessage(req, res));
router.post('/checkPhone', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('receiver').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).checkPhone(req, res));
router.post('/deleteMessage', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('messageKey').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).deleteMessage(req, res));
router.post('/deleteMessageForMe', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('messageKey').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).deleteMessageForMe(req, res));
router.post('/sendAudio', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('url').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendAudio(req, res));
router.post('/sendPTT', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('url').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendPTT(req, res));
router.post('/sendVideo', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('url').notEmpty(), (0, express_validator_1.body)('caption'), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendVideo(req, res));
router.post('/sendFile', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('url').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendFile(req, res));
router.post('/sendImage', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('url').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendImage(req, res));
router.post('/sendStiker', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('url').notEmpty(), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendStiker(req, res));
router.post('/sendGif', (0, express_validator_1.query)('id').notEmpty(), (0, express_validator_1.body)('phone'), (0, express_validator_1.body)('chat').if((0, express_validator_1.body)('phone').not().exists()).notEmpty(), (0, express_validator_1.body)('url').notEmpty(), (0, express_validator_1.body)('caption'), requestValidator_1.default, sessionValidator_1.default, (req, res) => new Message_1.default(req, res).sendGif(req, res));
exports.default = router;