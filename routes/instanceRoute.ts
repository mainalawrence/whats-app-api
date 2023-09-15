import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from '../Middleware/requestValidator'
import sessionValidator from '../Middleware/sessionValidator'
import Instance from '../Models/Instance'

const router = Router()

router.post(
    '/setPresence',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    body('presence').isIn(['unavailable', 'available', 'composing', 'recording', 'paused']).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Instance().setPresence(req, res)
)

router.post(
    '/setDisplayPicture',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    body('imageURL').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Instance().setDisplayPicture(req, res)
)

router.post(
    '/createProduct',
    query('id').notEmpty(),
    body('name').notEmpty(),
    body('retailerId'),
    body('url'),
    body('description'),
    body('price').isInt().notEmpty(),
    body('currency').notEmpty(),
    body('isHidden').isBoolean(),
    body('images').isArray({ min: 1 }).notEmpty(),
    body('originCountryCode'),
    requestValidator,
    sessionValidator,
    (req, res) => new Instance().createProduct(req, res)
)

router.post(
    '/updateProduct',
    query('id').notEmpty(),
    body('productId').isString().notEmpty(),
    body('name').notEmpty(),
    body('retailerId'),
    body('url'),
    body('description').notEmpty(),
    body('price').isInt().notEmpty(),
    body('currency').notEmpty(),
    body('isHidden').isBoolean().notEmpty(),
    body('images').isArray({ min: 1 }).notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Instance().updateProduct(req, res)
)

router.post(
    '/deleteProduct',
    query('id').notEmpty(),
    body('productIds').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Instance().deleteProduct(req, res)
)

router.get(
    '/me',
    query('id').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Instance().me(req, res)
)

export default router
