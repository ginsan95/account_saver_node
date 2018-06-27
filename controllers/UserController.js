const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const User = require('../models/User');
const MyError = require('../models/MyError');

exports.userData = (req, res, next) => {
    new Promise((resolve, reject) => {
        resolve(User.findById(req.userId, {password: 0}).exec());
    })
    .then(user => {
        if (!user) {
            throw {
                status: 404,
                message: 'User not found.'
            }
        }
        res.json({
            apiStatus: 'success',
            user
        });
    })
    .catch(error => next(error));
};

exports.changeName = [
    check('name').isLength({min:1}).trim().withMessage('Name must be specified.'),
    sanitizeBody('*').trim().escape(),
    (req, res, next) => {
        new Promise((resolve, reject) => {
            const error = validationResult(req);
            if (!error.isEmpty()) {
                return next(new MyError(error));
            }
            resolve(User.findById(req.userId).exec());
        })
        .then(user => {
            if (!user) {
                throw {
                    status: 404,
                    message: 'User not found.'
                }
            }
            const {name} = req.body;
            return User.findByIdAndUpdate(req.userId, {name}, {new: true}).exec();
        })
        .then(user => {
            if (!user) {
                throw {
                    message: 'Failed to update user\'s name'
                }
            }
            user.password = undefined;
            res.json({
                apiStatus: 'success',
                user
            })
        })
        .catch(error => next(error));
    }
];
