const jwt = require('jsonwebtoken');
const config = require('../config');

function verifyToken(req, res, next) {
    const token = req.headers['token'] || req.query.token || req.body.token;

    if (!token) {
        return next({
            status: 403,
            message: 'Missing token.'
        })
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return next({
                apiStatus: 'authentication error',
                message: 'Failed to authenticate token.'
            });
        }

        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyToken;