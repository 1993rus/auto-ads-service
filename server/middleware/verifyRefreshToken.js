require('dotenv').config()
const jwt = require('jsonwebtoken')

const verifyRefreshToken = (req, res, next) =>  {
    try {
        const { refreshToken } = req.cookies
        const { user } = jwt.verify(refreshToken, process.env.REFRESH_SERCRET_KEY)
        res.locals.user = user
        next()
    } catch (error) {
        console.log("INVALID REFRESH TOKEN")
        res.status(401).json({ error: "Сессия истекла" })
    }
}

module.exports = verifyRefreshToken