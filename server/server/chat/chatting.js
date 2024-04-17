const socketIo = require('socket.io')
const db = require('../dbconfig/db')
const connection = db.promise()
const express = require('express')
const router = express.Router()
let io
router.get('/getchattinghistory', async (req, res) => {
    const {room_name} = req.body
    try{
        let query = 'select * from chat where room_name=?'
        const [text] = await connection.execute(query,room_name)
        res.status(200).json({data: text})
    } catch (err) {
        res.status(500).json({msg: '채팅기록 불러오기 실패'})
    }
})
router.get('/getchatroom', async (req, res) => {
    const {member} = req.body
    try{
        let query = 'select room_name from chatmember where member=? order by room_name asc'
        const [room_list] = await connection.execute(query,member)
        res.status(200).json({room: room_list})
    } catch (err) {
        res.status(500).json({msg: '채팅방 목록 불러오기 실패'})
    }
})
router.post('/makechatroom', async (req, res) => {
    const {room_name, member} = req.body
    for(i=0;i<member.length;i++) {
        try{
            let query = 'insert into chatmember (room_name,member) values (?,?)'
            let param = [room_name, member[i]]
            [rows] = await connection.execute(query,param)
            res.status(200).json({msg: '채팅방 만들기 성공'})
        } catch (err) {
            res.status(500).json({msg: '채팅방 만들기 실패'})
        }
    }
    
})
const connectSocket = (server) => {
    io = socketIo(server)
    io.on('connection', (socket) => {
        socket.on('join',(data) => {
            socket.join(data.room)            
        })
        socket.on('sendMsg', async (data) => {
            try {
                const {sender, reciever, text} = data
                const date = new Date().toISOString().slice(0,19).replace('T', ' ')
                let param = [sender, reciever, text]
                await connection.execute('insert into chat (sender, receiver, text, date) values (?, ?, ?, ?)',param)
                io.to(data.room).emit('recieveMsg',data)
            } catch(err) {
                console.error(err)
            }
        })
        socket.on('disconnect', () => {
            console.log('연결종료')
        })
    })
}
module.exports = {connectSocket}