const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const multiparty = require('multiparty');
const path = require('path');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

let gfs;
Grid.mongo = mongoose.mongo;
const connection = mongoose.connection;

connection.once('open', () => {
    gfs = Grid(connection.db);
});

function initGridFs(callback) {
    if (connection.isConnected) {
        gfs = Grid(connection.db);
        callback();
    }
    connection.once('open', () => {
        gfs = Grid(connection.db);
        callback();
    });
}

const icons = (req, res, next) => {
    if (gfs) {
        gfs.files.find({ 'metadata.owner': req.userId }, '_id filename').toArray((error, files) => {
            if (error) {
                next(error);
            }
            const icons = files.map(file => file._id);
            res.json({
                apiStatus: 'success',
                icons
            });
        });

    } else {
        initGridFs(() => icons(req, res, next));
    }
};

const icon = (req, res, next) => {
    if (gfs) {
        const id = mongoose.Types.ObjectId(req.params.id);
        const readstream = gfs.createReadStream({
            _id: id
        });

        readstream.on('error', error => {
            next(error);
        });

        readstream.pipe(res);

    } else {
        initGridFs(() => icon(req, res, next));
    }
};

const uploadIcon = (req, res, next) => {
    if (gfs) {
        const form = new multiparty.Form();

        form.on('part', (part) => {
            const {filename} = part;
            if (filename) {
                const writestream = gfs.createWriteStream({
                    filename: `${Date.now()}${path.extname(filename)}`,
                    metadata: {
                        owner: req.userId
                    }
                });
                part.pipe(writestream);

                writestream.on('close', (file) => {
                    res.json({
                        apiStatus: 'success',
                        icon: {
                            id: file._id,
                            filename: file.filename,
                        }
                    });
                });

                writestream.on('error', (error) => {
                    next(error);
                });

            } else {
                next({
                    status: 400,
                    message: 'Invalid file'
                });
            }
        });

        form.on('error', (error) => {
            next(error);
        });

        form.parse(req);
    } else {
        initGridFs(() => uploadIcon(req, res, next));
    }
};

const deleteIcon = [
    check('icon').isLength({min:1}).withMessage('Icon must not be empty'),
    sanitizeBody('*').trim().escape(),
    (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return next(new MyError(error));
        }

        if (gfs) {
            const id = mongoose.Types.ObjectId(req.body.icon);
            gfs.remove({_id: id}, (err) => {
                if (err) {
                    return next(err);
                }
                res.json({
                    apiStatus: 'success'
                });
            })

        } else {
            initGridFs(() => deleteIcon[deleteIcon.length-1](req, res, next));
        }
    }
];

module.exports = {
    icons,
    icon,
    uploadIcon,
    deleteIcon
};
