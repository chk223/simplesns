const jwt = require('jsonwebtoken')
const {v4: uuidv4} = require('uuid')
const SECRET_KEY = 'secretkey';
const REFRESH_SECRET_KEY = 'refreshsecretkey'

const generateAccessToken = (payload) => {
    return jwt.sign(payload, SECRET_KEY, {expiresIn: '1h'})
}

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_SECRET_KEY)
}

const verifyToken = (token, secretKey) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                reject(err)
                return
            }
            resolve(decoded)
        })
    })
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    uuidv4
}