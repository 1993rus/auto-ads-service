const express = require('express')
const { Op } = require('sequelize')
const bcrypt = require("bcrypt");
const generateToken = require('../utils/generateToken');
const cookieConfig = require('../utils/cookie.config');
const { User } =require('../db/models')


const userRouter = express.Router()

userRouter.get('/', (req, res) => {
    res.json({ message: 'user get ok' })
})

userRouter.post('/registration', async (req, res) => {
    try {
        const { username, email, password } = req.body
        console.log(req.body)
        console.log(!(username && email && password))
        if(!(username && email && password)) {
            res.status(400).json({ error: 'Все поля обязательны для заполнения' })
            return
        }

        const existingUser = await User.findOne({
            where: { [Op.or]: [{ username }, { email }] }
        })

        if( existingUser ) {
            res.status(409).json( { error: 'Пользователь уже существует' })
            return
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const newUser = await User.create({
            username, email, password: hashedPassword
        })

        console.log('USER: ', newUser.get())
        const cleanUser = newUser.get()
        delete cleanUser.password
        delete cleanUser.createdAt
        delete cleanUser.updetedAt

        const { accessToken, refreshToken } = generateToken({ user: cleanUser })
        res
            .cookie('refreshToken', refreshToken, cookieConfig)
            .json({ accessToken, user: cleanUser })
    } catch (error) {
        console.log('ERROR: ', error.message)
        res.status(500).json({ error: 'Ошибка сервера' })
    }

})

module.exports = userRouter