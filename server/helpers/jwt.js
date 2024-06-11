const jwt = require('jsonwebtoken');

const secret_key = process.env.SECRET_KEY

function signToken(data) {
    return (jwt.sign(data, secret_key));
}

function verifyToken(token) {
    return (jwt.verify(token, secret_key))
}

module.exports = { signToken, verifyToken }