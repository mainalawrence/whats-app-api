import { Router } from 'express'
import { body } from 'express-validator'
import requestValidator from '../Middleware/requestValidator'
import nodeValidator from '../Middleware/nodeValidator'
import Session from '../Models/Session'

let router = Router()
let WLSession = new Session();

router.get('/find/:id', nodeValidator, (req, res) => WLSession.find(res))
router.get('/status/:id', nodeValidator, (req, res) => WLSession.status(res))
router.post('/add', body('id').notEmpty(), body('isLegacy').notEmpty(), requestValidator, (req, res) => WLSession.add(req, res))
router.delete('/delete/:id', nodeValidator, (req, res) => WLSession.del(req, res))
router.delete('/clearInstance/:id', nodeValidator, (req, res) => WLSession.clearInstance(req, res))

export default router
