import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from '../Middleware/requestValidator'
import sessionValidator from '../Middleware/sessionValidator'
import Users from '../Models/Users'

const router = Router()

router.post(
    '/userStatus',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Users().userStatus(req, res)
)

router.post(
    '/userPresence',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Users().userPresence(req, res)
)

router.post(
    '/displayPicture',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Users().userDisplayPicture(req, res)
)

router.post(
    '/blockUser',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Users().blockUser(req, res)
)

router.post(
    '/unblockUser',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Users().unblockUser(req, res)
)

router.post(
    '/userBusinessProfile',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Users().businessProfile(req, res)
)

router.post(
    '/getProducts',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Users().getProducts(req, res)
)

router.post(
    '/getProduct',
    query('id').notEmpty(),
    body('phone').notEmpty(),
    body('productId').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Users().getProduct(req, res)
)

router.post(
    '/getOrder',
    query('id').notEmpty(),
    body('orderId').notEmpty(),
    body('orderToken').notEmpty(),
    requestValidator,
    sessionValidator,
    (req, res) => new Users().getOrder(req, res)
)

export default router
