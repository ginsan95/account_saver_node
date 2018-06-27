const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const MyError = require('../models/MyError');
const config = require('../config');

exports.register = [
    check('username').isLength({min:4}).trim().withMessage('Username must be at least 4 characters.'),
    check('password').isLength({min:4}).trim().withMessage('Password must be at least 4 characters.'),
    check('name').isLength({min:1}).trim().withMessage('Name must be specified.'),
    sanitizeBody('*').trim().escape(),
    (req, res, next) => {
        new Promise((resolve, reject) => {
            const error = validationResult(req);
            if (!error.isEmpty()) {
                return next(new MyError(error));
            }

            const {username, password, name} = req.body;
            const hashedPassword = bcrypt.hashSync(password, 8);
            const user = User({
                username, password: hashedPassword, name
            });
            resolve(user.save());
        })
        .then(user => {
            res.json({
                apiStatus: 'success',
                userId: user._id
            })
        })
        .catch(error => next(error));
    }
];

exports.login = [
    sanitizeBody('*').trim().escape(),
    (req, res, next) => {
        const {username, password} = req.body;

        new Promise((resolve, reject) => {
            resolve(User.findOne({username}).exec());
        })
        .then(user => {
            if (!user) {
                throw {
                    status: 404,
                    message: 'User not found.'
                }
            }

            const passwordIsValid = bcrypt.compareSync(password, user.password);
            if (!passwordIsValid) {
                throw {
                    status: 401,
                    message: 'Wrong password.'
                }
            }

            const token = jwt.sign({id: user._id}, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            const {username, name} = user;

            res.json({
                apiStatus: 'success',
                token,
                user: {username, name}
            });
        })
        .catch(error => next(error));
    }
];
