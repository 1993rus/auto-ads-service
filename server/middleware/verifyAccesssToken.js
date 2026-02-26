require('dotenv').config()
const jwt = require('jsonwebtoken')

const verifyAccessToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Токен не предоставлен" })
        }

        const accessToken = authHeader.split(' ')[1]
        const { user } = jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY)
        res.locals.user = user
        next()
    } catch (error) {
        console.log("INVALID ACCESS TOKEN:", error.message)
        res.status(401).json({ error: "Недействительный токен" })
    }
}

module.exports = verifyAccessToken