const jwt = require('jsonwebtoken')
const jwtConfig = require('./jwt.config')

require('dotenv').config()

const ACCESS_SECRET = process.env.ACCESS_SECRET_KEY
const REFRESH_SECRET = process.env.REFRESH_SECRET_KEY

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error('JWT секреты не найдены в .env')
}

const generateToken = (payload) => {
    return {
        accessToken: jwt.sign(payload, ACCESS_SECRET, { expiresIn: jwtConfig.access }),
        refreshToken: jwt.sign(payload, REFRESH_SECRET, { expiresIn: jwtConfig.refresh })
    }
}

module.exports = generateToken