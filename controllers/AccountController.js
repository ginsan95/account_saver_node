const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const mongoose = require('mongoose');
const async = require('async');

const Account = require('../models/Account');
const SecurityQuestion = require('../models/SecurityQuestion');
const MyError = require('../models/MyError');
const securityQuestionController = require('../controllers/SecurityQuestionController');

const accountVerifications = [
    check('gameName').isLength({min:1}).withMessage('Game name must not be empty'),
    check('username').isLength({min:1}).withMessage('Username must not be empty'),
    check('password').isLength({min:1}).withMessage('Password must not be empty'),
    check('email').optional({checkFalsy:true}).isEmail().withMessage('Invalid email'),
    sanitizeBody("*").trim().escape()
];

exports.accounts = (req, res, next) => {
    new Promise((resolve, reject) => {
        const {ObjectId} = mongoose.Types;
        resolve(
            Account.aggregate([
                { $match: { owner: new ObjectId(req.userId) } },
                {
                    $lookup: {
                        from: "securityquestions",
                        localField: "_id",
                        foreignField: "account",
                        as: "questions"
                    }
                }
            ])
        );

    }).then(accounts => {
        res.json({
            apiStatus: 'success',
            accounts
        });

    }).catch(error => next(error));
};

exports.createAccount = [
    ...accountVerifications,
    ...securityQuestionController.securityQuestionsValidation,
    (req, res, next) => {
        new Promise((resolve, reject) => {
            const error = validationResult(req);
            if (!error.isEmpty()) {
                return next(new MyError(error));
            }
            const account = Account(req.body);
            account.owner = req.userId;
            resolve(account.save());

        }).then((account) => {
            req.account = account.toObject();
            next();
        }).catch(error => next(error));
    },
    ...securityQuestionController.createSecurityQuestions,
];

exports.updateAccount = [
    check('id').isLength({min:1}).withMessage('Missing account id'),
    ...accountVerifications,
    ...securityQuestionController.securityQuestionsValidation,
    (req, res, next) => {
        new Promise((resolve, reject) => {
            const error = validationResult(req);
            if (!error.isEmpty()) {
                return next(new MyError(error));
            }
            resolve(
                Account.findByIdAndUpdate(req.body.id, {
                    updatedDate: Date.now(),
                    ...req.body
                }, {new:true}).exec()
            );

        }).then(account => {
            if (!account) {
                throw {
                    status: 404,
                    message: 'Account not found.'
                }
            }
            req.account = account.toObject();
            next();
        }).catch(error => next(error));
    },
    ...securityQuestionController.updateSecurityQuestions
];

exports.deleteAccount = [
    check('id').isLength({min:1}).withMessage('Missing account id'),
    sanitizeBody("*").trim().escape(),
    (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(new MyError(error));
        }

        async.parallel({
            account: callback => {
                Account.findByIdAndRemove(req.body.id, callback);
            },
            questions: callback => {
                SecurityQuestion.deleteMany({account: req.body.id}, callback);
            }
        }, (error, results) => {
            if (error) {
                return next(error);
            }

            let {account} = results;
            if (!account) {
                const error = new Error('Account not found.');
                error.status = 404;
                return next(error);
            }

            res.json({
                apiStatus: 'success',
                account
            });
        });
    }
];
