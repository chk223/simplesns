const express = require('express')
const db = require('../dbconfig/db')
const connection = db.promise()
const {generateAccessToken, generateRefreshToken, verifyToken, uuidv4} = require('../login/jwt')
const bodyParser = require('body-parser')
const router = express.Router()
router.use(bodyParser.json())

const tokenVeryfyMiddleware = (req,res,next) => {
    const token = req.headers['authorization']
    if(!token) {
        return res.status(403).json({msg: '토큰이 없음!'})
    }
    verifyToken(token, 'secretkey')
    .then(decoded => {
        req.decoded = decoded
        next()
    }).catch(err => {
        res.status(401).json({msg: '토큰 인증 실패!'})
    })
}

router.post('/login', async (req, res) => {
    const {id, pw} = req.body
    try {
        let query = 'select * from user where id=? and pw=?'
        let param = [id,pw]
        const [users] = await connection.execute(query,param)
        if (users.length>0) {
            const accessToken = generateAccessToken({ id: users[0].id });
            const refreshToken = generateRefreshToken({ id: users[0].id, tokenId: uuidv4() })
            
            const expirationDate = new Date()
            expirationDate.setDate(expirationDate.getDate() + 7)
            await connection.execute('update user set refresh_token = ?, access_token = ?, refreshTokenExpiration = ? where id = ?', [refreshToken, accessToken, expirationDate, id])
            res.status(200).json({msg: '로그인 성공',accessToken,refreshToken})
        }
        else {
            res.status(401).json({msg: '로그인 실패'})
        }
    } catch(err) {
        res.status(400).json({msg: err})
    }
})
/**로그아웃 시 access,refresh 토큰 전부 무효화함. (null로 만듦) */
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body
    try {
        const decoded = await verifyToken(refreshToken, 'refreshsecretkey')
        await connection.execute('update user set refresh_token = NULL, access_token = NULL,  refreshTokenExpiration = NULL WHERE id = ?', [decoded.id])
        res.status(200).json({message: '로그아웃 성공'})
    } catch (err) {
        res.status(500).json({message: '로그아웃 실패'})
    }
})
/**client측에서 accessToken의 유효성 검사 후 만료된 경우 해당 api를 호출하여
 * accessToken을 발급받음 (accesstoken을 받아올 때 accesstoken의 만료시간도
 * 함께 받아와서 만료가 얼마 남지 않은 경우 해당 api호출하여 재발급받음)
 */
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body

    try {
        const decoded = await verifyToken(refreshToken, 'refreshsecretkey')
        const [users] = await connection.execute('select * from user where id = ?', [decoded.id])
        if (users.length > 0 && users[0].refreshToken === refreshToken && new Date(users[0].refreshTokenExpiration) > new Date()) {
            const newAccessToken = generateAccessToken({ id: users[0].id })
            const newRefreshToken = generateRefreshToken({ id: users[0].id, tokenId: uuidv4() })
            const expirationDate = new Date()
            expirationDate.setDate(expirationDate.getDate() + 7)
            await connection.execute('update user set refresh_token = ?, access_token = ?, refreshTokenExpiration = ? where id = ?', [newRefreshToken, newAccessToken, expirationDate, decoded.id])
            res.status(200).json({
                message: '새로운 토큰 발급 성공!',
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            })
        } else {
            res.status(401).json({message: '토큰 인증 실패!'})
        }
    } catch (err) {
        res.status(401).json({message: '토큰 인증 실패!'})
    }
})
/**클라이언트에서 주기적으로 accesstoken의 유효 여부를 요청함. */
router.get('/protected', async (req, res) => {
    const token = req.headers['authorization']
    if (!token) {
        return res.status(403).json({message: '토큰이 없습니다.'})    }
    try {
        const decoded = await verifyToken(token, 'secretkey')
        const [users] = await connection.execute('select * from user where id = ?', [decoded.id])

        if (users.length > 0 && users[0].accessToken === token) {
            res.status(200).json({
                message: '인증 성공!',
                user: decoded
            });
        } else {
            res.status(401).json({message: '토큰 인증 실패'})
        }
    } catch (err) {
        res.status(401).json({message: '토큰 인증 실패'})
    }
})
module.exports = router