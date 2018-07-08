const mongoose = require('mongoose');
const request = require('request');
const multiparty = require("multiparty");
const path = require('path');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const {iconsUrl} = require('../constant');
const MyError = require('../models/MyError');

exports.icons = [
    check('pagesize').optional({checkFalsy:true}).isInt().withMessage('Page size can only be digits'),
    check('offset').optional({checkFalsy:true}).isInt().withMessage('Offset can only be digits'),
    sanitizeBody('*').trim().escape(),
    (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(new MyError(error));
        }

        const {pagesize=100, offset} = req.query;
        request(`${iconsUrl}/${req.userId}?pagesize=${pagesize}${offset ? `&offset=${offset}` : ''}`, (error, iconRes, body) => {
            if (error) {
                return next(error);
            }
            body = JSON.parse(body);
            if (iconRes.statusCode !== 200) {
                return next(body);
            }
            res.json({
                apiStatus: 'success',
                icons: body
            });
        });
    }
];

exports.uploadIcon = (req, res, next) => {
    const form = new multiparty.Form();

    form.on('part', function(part){
        const {filename} = part;
        if (filename) {
            const r = request.post(`${iconsUrl}/${req.userId}/${Date.now()}${path.extname(filename)}`, { headers: {'transfer-encoding': 'chunked'} }, (error, formRes, body) => {
                if (error) {
                    return next(error);
                }
                body = JSON.parse(body);
                if (formRes.statusCode !== 200) {
                    return next(body);
                }
                res.json({
                    apiStatus: 'success',
                    icon: body
                });
            });

            const formData = r.form();
            formData.append("file", part, {filename,contentType: part["content-type"]});

        } else {
            next({
                status: 400,
                message: 'Invalid file'
            });
        }
    });

    form.on('error', function(error){
        next(error);
    });

    form.parse(req);
};

exports.deleteIcon = [
    check('icon').isLength({min:1}).withMessage('Icon must not be empty')
        .custom((value, {req}) => {
            if (!value || !value.startsWith(`${iconsUrl}/${req.userId}/`)) {
                throw new Error('Invalid icon url');
            }
            return true;
        }),
    (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(new MyError(error));
        }

        request.delete(req.body.icon, (error, iconRes, body) => {
            if (error) {
                return next(error);
            }
            body = JSON.parse(body);
            if (iconRes.statusCode !== 200) {
                return next(body);
            }
            res.json({
                apiStatus: 'success'
            });
        });
    }
];
