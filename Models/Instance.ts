import { existsSync, readFileSync } from "fs";
import Helper from "../helper/Helper";
import WLMeInterface from "../interfaces/WLMeInterface";
import { getSession } from "../whatsapp";

export default class Instance extends Helper {
    async setPresence(req, res) {
        const session = getSession(res.locals.sessionId)
        const phone = this.formatPhone(req.body.phone)
        const { presence } = req.body

        try {
            const updated = await session.sendPresenceUpdate(presence, phone)

            if (updated) {
                return this.response(res, 200, true, '')
            }

            return this.response(res, 500, false, 'Failed to set user presence.')
        } catch {
            return this.response(res, 500, false, 'Failed to set user presence.')
        }
    }

    async setDisplayPicture(req, res) {
        const session = getSession(res.locals.sessionId)
        const phone = this.formatPhone(req.body.phone)
        const { imageURL } = req.body

        try {
            const updated = await session.updateProfilePicture(phone, { url: imageURL })

            if (updated) {
                return this.response(res, 200, true, '')
            }

            return this.response(res, 500, false, 'Failed to set user display picture.')
        } catch {
            return this.response(res, 500, false, 'Failed to set user display picture.')
        }
    }

    async createProduct(req, res) {
        const session = getSession(res.locals.sessionId)
        const { name, retailerId, url, description, price, currency, isHidden, originCountryCode, images } = req.body

        try {
            const product = await session.productCreate({
                name,
                retailerId,
                url,
                description,
                price,
                currency,
                isHidden,
                originCountryCode,
                images: images.map((image) => {
                    return { url: image }
                }),
            })

            if (product) {
                return this.response(res, 200, true, '', product)
            }

            return this.response(res, 500, false, 'Failed to create product')
        } catch (ex) {
            console.log(ex)
            return this.response(res, 500, false, 'Failed to create product.')
        }
    }

    async updateProduct(req, res) {
        const session = getSession(res.locals.sessionId)
        const { productId, name, retailerId, url, description, price, currency, isHidden, originCountryCode, images } =
            req.body

        try {
            const product = await session.productUpdate(productId, {
                name,
                retailerId,
                url,
                description,
                price,
                currency,
                isHidden,
                originCountryCode,
                images: images.map((image) => {
                    return { url: image }
                }),
            })

            if (product) {
                return this.response(res, 200, true, '', product)
            }

            return this.response(res, 500, false, 'Failed to update product')
        } catch {
            return this.response(res, 500, false, 'Failed to update product.')
        }
    }

    async deleteProduct(req, res) {
        const session = getSession(res.locals.sessionId)
        const { productIds } = req.body

        try {
            // TODO: need fix
            // const deleted = await session.productDelete(Array.isArray() ? productIds : [productIds])

            // return response(res, 200, true, '', deleted)
        } catch {
            return this.response(res, 500, false, 'Failed to update product.')
        }
    }

    async me(req, res) {
        const session = getSession(res.locals.sessionId)
        try {

            let dataObj: WLMeInterface = {
                me: {
                    id: ''
                },
                image: '',
                presence: '',
                status: '',
                isBussines: {},
                businessProfile: {
                    wid: ''
                }
            };
            let phone
            let image
            if (existsSync('./sessions/md_' + res.locals.sessionId + '/creds.json')) {
                try {
                    let dataStore = await JSON.parse(readFileSync('./sessions/md_' + res.locals.sessionId + '/creds.json', 'utf8'))
                    if (dataStore.me) {
                        dataObj.me = dataStore.me
                        phone = dataStore.me.id.replace('@s.whatsapp.net', '').split(':')[0]
                    } else {
                        dataObj.me = session.user
                        phone = session.user.phone
                    }
                } catch (error) {
                    (process.env.DEBUG_MODE == 'true') ? console.log("Instance me read creds :" + error) : '';
                }
            } else {
                dataObj.me = session.user
                phone = session.user.phone
            }
            if (dataObj) {
                dataObj.me['phone'] = phone

                try {
                    image = await session.profilePictureUrl(this.formatPhone(phone), 'image')
                } catch (error) {
                    (process.env.DEBUG_MODE == 'true') ? console.log("Instance me read profilePictureUrl " + error) : '';
                }

                if (dataObj.me.hasOwnProperty('id')) {
                    delete dataObj.me.id
                }
                try {
                    image = await session.profilePictureUrl(this.formatPhone(phone), 'image')

                    const presence = await session.presenceSubscribe(this.formatPhone(phone))
                    const status = await session.fetchStatus(this.formatPhone(phone))
                    const profile = await session.getBusinessProfile(this.formatPhone(phone))

                    dataObj.image = image;
                    dataObj.presence = presence;
                    dataObj.status = status;
                    dataObj.isBussines = profile ? 1 : 0;
                    dataObj.businessProfile = profile ? profile : null;
                    if (profile) {
                        delete dataObj.businessProfile.wid
                    }
                } catch (error) {
                    (process.env.DEBUG_MODE == 'true') ? console.log("Instance me 3 part  " + error) : '';
                }
            }

            return this.response(res, 200, true, '', dataObj)
        } catch {
            return this.response(res, 500, false, 'Failed to get user Data.')
        }
    }
}