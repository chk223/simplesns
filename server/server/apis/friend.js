const db = require('../dbconfig/db')
const connection = db.promise()
const express = require('express')
const router = express.Router()

/**친구 추가,삭제 */
router.post('/friend', async (req, res) => {
    const {user, friend} = req.body
    param = [user, friend]
    try {
        let query = 'select count(*)"friend" from friend where own = ? and friend = ?'
        const [rows, fields] = await connection.execute(query, param)
        if(rows[0].follow == 0) {
            try{
                query = 'insert into friend (own, friend) values (?,?)'
                const [rows, fields] = await connection.execute(query, param)
                res.status(200).json({msg: '친구 추가 완료!'})
            } catch (err) {
                res.status(401).json({msg: err})
            }
        } else {
            try{
                query = 'delete from friend where own = ? and friend = ?'
                const [rows, fields] = await connection.execute(query, param)
                res.status(200).json({msg: '친구 삭제 완료!'})
            } catch (err) {
                res.status(401).json({msg: err})
            }
        }
    } catch (err) {
        res.status(401).json({msg: err})
    }
})
//친구 차단 기능 추가해야 함.
/**해당 유저의 친구 목록 반환 */
router.get('/myfriend', async (req, res) => {
    const {user} = req.body
    param = [user]
    try {
        const query = 'select friend from friend where own = ?'
        const [ rows, fields] = await connection.execute(query, param)
        res.status(200).json({msg: rows})
    } catch(err) {
        res.status(401).json({msg: err})
    }
})
/** 나를 친구로 추가 한 사람 목록 */
router.get('/follower', async (req, res) => {
    const {follow_object} = req.body
    param = [follow_object]
    try {
        const query = 'select own from friend where friend = ?'
        const [ rows, fields] = await connection.execute(query, param)
        res.status(200).json({msg: rows})
    } catch(err) {
        res.status(401).json({msg: err})
    }
})
/** 나를 친구로 추가 한 사람 수 */
router.get('/followernum', async (req, res) => {
    const {follow_object} = req.body
    param = [follow_object]
    try {
        const query = 'select count(*)"dup" from friend where friend = ?'
        const [ rows, fields] = await connection.execute(query, param)
        res.status(200).json({msg: rows[0].dup})
    } catch(err) {
        res.status(401).json({msg: err})
    }
})

module.exports = router