const db = require('../dbconfig/db')
const connection = db.promise()
const express = require('express')
const router = express.Router()
router.get('/user', async (req, res) => {
    try {
        const query = 'select * from user;';
        const [rows, fields] = await connection.execute(query);
        res.status(200).json({ msg: rows });
    } catch (err) {
        res.status(401).json({ msg: err });
    }
})
router.put('/modifynickname', async (req, res) => {
    const {nickname} = req.body
    let param = [nickname]
    try {
        const query = 'update user set nickname=? where uuid=?'
        const [rows, rields] = await connection.execute(query, param)
        res.status(200).json({msg: '닉네임 수정 완료!'})
    } catch (err) {
        res.status(401).json({msg: err})
    }
})
router.put('/modifypw', async (req, res) => {
    const {pw} = req.body
    let param = [pw]
    try {
        const query = 'update user set pw=? where uuid=?'
        const [rows, rields] = await connection.execute(query, param)
        res.status(200).json({msg: '닉네임 수정 완료!'})
    } catch (err) {
        res.status(401).json({msg: err})
    }
})
module.exports = router