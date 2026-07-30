const { PrismaClient } = require('../generated/prisma/index.js')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require ('dotenv')
dotenv.config()

const MemberController = {
    signup: async (req, res) => {
        try {
            const { name, username, password } = req.body
            const hashedPassword = await bcrypt.hash(password, 10)
            const newMember = await prisma.member.create({
                data: {
                    name: name,
                    username: username,
                    password: hashedPassword
                }
            })
            res.json(newMember)
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }, // <-- แก้ไข: เพิ่ม comma

    signin: async (req, res) => {
        try {
            const { username, password } = req.body

            const findUser = await prisma.member.findFirst({
                where: { username },
                select: { id: true, password: true }
            })

            if (!findUser) return res.status(401).json({ message: 'unauthorized' })

            const compare = await bcrypt.compare(password, findUser.password)
            if (!compare) return res.status(401).json({ message: 'unauthorized' })

            const secret_key = process.env.SECRET_KEY || "defaultSecretKey"
            const payload = { id: findUser.id }
            const options = { expiresIn: '1d' }

            const token = jwt.sign(payload, secret_key, options)

            res.json({ token })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    },

    info: async (req, res) => {
        try {
            const token = req.headers['authorization'].replace('Bearer ', '')
            const secret_key = process.env.SECRET_KEY || "defaultSecretKey"
            const payload = jwt.verify(token, secret_key)
            const member_id = payload.id

            const member = await prisma.member.findFirst({
                where: {
                    id: member_id
                },
                select: {
                    name: true,
                    username: true
                }
            })

            res.json(member)
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    },
    update: async (req, res) => {
        try {
            const { name, username, password } = req.body
            const token = req.headers['authorization'].replace('Bearer ', '')
            const secret_key = process.env.SECRET_KEY || "defaultSecretKey"
            const payload = jwt.verify(token, secret_key)
            const member_id = payload.id

            const oldMember = await prisma.member.findFirst({
            where: {
                id: member_id
            }
            })

            const hashedPassword = await bcrypt.hash(password, 10)

            await prisma.member.update({
            data: {
                name: name,
                username: username,
                password: password == '' ? oldMember.password : hashedPassword
            },
            where: {
                id: member_id
            }
            })

            res.json({ message: 'success' })
        } catch (err) {
            console.log(err) 
            res.status(500).json({ error: err.message })
        }
    }
}

module.exports = MemberController