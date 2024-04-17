const db = require('../dbconfig/db')
const connection = db.promise()
const express = require('express')
const router = express.Router()
router.get('/allpost', async (req, res) => {
    try {
        const query = 'select * from post;';
        const [rows, fields] = await connection.execute(query);
        res.status(200).json({ msg: rows });
    } catch (err) {
        res.status(401).json({ msg: err });
    }
})
router.get('/userpost', async (req, res) => {
    const {user_code} = req.body
    const param = [user_code]
    try {
        const query = 'select * from post where owner = ?';
        const [rows, fields] = await connection.execute(query, param);
        res.status(200).json({ msg: rows });
    } catch (err) {
        res.status(401).json({ msg: err });
    }
})
router.get('/likedpost', async (req, res) => {
    const {post_num} = req.body
    const param = [post_num]
    try {
        const query = 'update post set liked = liked+1 where post_num = ?';
        const [rows, fields] = await connection.execute(query, param);
        res.status(200).json({ msg: '좋아요+1' });
    } catch (err) {
        res.status(401).json({ msg: err });
    }
})
/** 현재 text만 구현.  */
router.post('/posting', async( req, res) => {
    const {owner, text} = req.body
    try {
        const query = 'insert into post (owner,text,date) values (?,?,?);'
        const date = new Date().toISOString().slice(0,19).replace('T', ' ')
        const param = [owner, text, date]
        const [rows, fields] = await connection.execute(query, param)
        res.status(200).json({msg: '포스팅 완료!'})
    } catch (err) {
        res.status(401).json({msg: err})
    }
})
router.put('/modifypost',async (req,res) => {
    const {post_num, text} = req.body
    const param = [text, post_num]
    try{
        const query = 'update post set text = ?, where post_num = ?'
        const [rows, fields] = await connection.execute(query, param)
        res.status(200).json({msg: '수정 성공!'})
    } catch (err) {
        res.status(401).json({msg: err})
    }
})
router.delete('/deletepost', async (req,res) => {
    const {post_num} = req.body
    param = [post_num]
    try{
        const query = ' delete from post where post_num = ?'
        const [rows, fields] = await connection.execute(query, param)
        res.status(200).json({msg: '포스트 삭제 완료!'})
    } catch (err) {
        res.status(401).json({msg: err})
    }
})
module.exports = router