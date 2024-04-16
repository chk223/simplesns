const db = require('../dbconfig/db')
const connection = db.promise()
const express = require('express')
const router = express.Router()
function createuuid() {
    const {v4: uuidv4} = require('uuid')
    const tokens = uuidv4().split('-')
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4]
}
router.post('/regist', async(req, res) => {
    const {id, pw, nick} = req.body
    try{
        let query = 'select count(*)"dup" from user where user_id = ?'
        let param = [id]
        const [rows, fields] = await connection.execute(query, param)
        if(rows[0].dup ==0){
            try {
                uuid = createuuid()
                query = 'insert into user (uuid,id, pw,nickname) values (?,?,?,?)'
                param = [uuid, id, pw, nick]
                const [rows, fields] = await connection.execute(query, param)
                res.status(200).json({msg: '회원가입 완료!'})
            } catch (err) {
                res.status(401).json({msg: err})
            }
        }
        else {
            res.status(400).json({msg: '아이디 중복'})
        }
    } catch(err) {
        res.status(401).json({msg: err})
    }
})
router.get('/dupnick', async(req, res) => {
    const {nick} = req.body
    const param = [nick]
    try{
        const query = 'select count(*)"dup" from user where user_nickname=?'
        const [rows, fields] = await connection.execute(query, param)
        res.status(200).json({msg: rows[0].dup})
    }catch(err) {
        res.status(401).json({msg: err})
    }
})
module.exports = router