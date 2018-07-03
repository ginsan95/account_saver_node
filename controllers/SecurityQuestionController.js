const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const SecurityQuestion = require('../models/SecurityQuestion');
const MyError = require('../models/MyError');

// Check for array
function convertArray(req, res, next) {
    if (!(req.body.questions instanceof Array)) {
        if (typeof req.body.questions === 'undefined') {
            req.body.questions = [];
        } else {
            req.body.questions = new Array(req.body.questions);
        }
    }
    next();
}

exports.securityQuestionsValidation = [
    check('questions.*.question').isLength({min:1}).withMessage('Question cannot be empty.'),
    sanitizeBody('questions.*.*').escape()
];

exports.createSecurityQuestions = [
    convertArray,
    (req, res, next) => {
        const {account} = req;
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(new MyError(error));
        }

        new Promise((resolve, reject) => {
            const {questions} = req.body;
            if (questions.length > 0) {
                for (let q of questions) {
                    q.account = account._id;
                }
                resolve(SecurityQuestion.insertMany(questions));
            } else {
                resolve([]);
            }

        }).then(questions => {
            account.questions = questions;
            res.json({
                apiStatus: 'success',
                account
            });

        }).catch(error => next(error))
    }
];

exports.updateSecurityQuestions = [
    convertArray,
    (req, res, next) => {
        const {account} = req;
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(new MyError(error));
        }

        new Promise((resolve, reject) => {
            // delete questions 1st
            resolve(SecurityQuestion.deleteMany({account: account._id}));

        }).then(details => {
            // add questions
            const {questions} = req.body;
            if (questions.length > 0) {
                for (let q of questions) {
                    q.account = account._id;
                }
                return SecurityQuestion.insertMany(questions);
            } else {
                return [];
            }

        }).then(questions => {
            account.questions = questions;
            res.json({
                apiStatus: 'success',
                account
            });

        }).catch(error => next(error))
    }
];
