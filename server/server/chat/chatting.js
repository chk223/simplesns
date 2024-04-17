const socketIo = require('socket.io')
const db = require('../dbconfig/db')
const connection = db.promise()
const express = require('express')
const router = express.Router()
let io
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