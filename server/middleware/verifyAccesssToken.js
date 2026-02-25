require('dotenv').config()
const jwt = require('jsonwebtoken')

const verifyAccessToken = (req, res, next) => {
    try {
        const accessToken = req.headers.authorization.split(' ')[1]
        const { user } = jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY)
        res.locals.user = user
        next()
    } catch (error) {
        console.log("INVALID ACCESS TOKEN")
        res.status.json({ error: "Недействительный токен" })
    }
}

module.exports = verifyAccessToken