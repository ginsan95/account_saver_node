const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const Account = require('../models/Account');
const MyError = require('../models/MyError');


exports.accounts = (req, res, next) => {
    new Promise((resolve, reject) => {
        resolve(Account.find({owner: req.userId}));

    }).then(accounts => {
        res.json({
            apiStatus: 'success',
            accounts
        });

    }).catch(error => next(error));
};

exports.createAccount = [
    check('gameName').isLength({min:1}).withMessage('Game name must not be empty'),
    check('username').isLength({min:1}).withMessage('Username must not be empty'),
    check('password').isLength({min:1}).withMessage('Password must not be empty'),
    check('email').optional({checkFalsy:true}).isEmail().withMessage('Invalid email'),
    sanitizeBody("*").trim().escape(),
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
            res.json({
                apiStatus: 'success',
                account
            })

        }).catch(error => next(error));
    }
];
