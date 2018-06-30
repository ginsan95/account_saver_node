const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accountSchema = Schema({
    gameName: {type: String, require: true},
    username: {type: String, require: true},
    password: {type: String, require: true},
    updatedDate: {type: Date, default: Date.now, require: true},
    owner: {type: Schema.ObjectId, ref:'User', require: true},

    email: {type: String, match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/},
    phoneNumber: {type: String, match: /(^\+)?[0-9]/},
    password2: String,
    description: String,
    gameIcon: String,
    isLocked: Boolean,
    lockPassword: String
});

module.exports = mongoose.model('Account', accountSchema);