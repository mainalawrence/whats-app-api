import { Router } from 'express'
import instanceRoute from './routes/instanceRoute'
import sessionsRoute from './routes/sessionsRoute'
import chatsRoute from './routes/chatsRoute'
import messagesRoute from './routes/messagesRoute'
import usersRoute from './routes/usersRoute'
import response from './response'

let router = Router()

router.use('/instance', instanceRoute)
router.use('/session', sessionsRoute)
router.use('/chats', chatsRoute)
router.use('/messages', messagesRoute)
router.use('/users', usersRoute)

router.all('*', (req, res) => {
    response(res, 404, false, 'The requested url cannot be found.')
})

export default router
