const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const securityQuestionSchema = Schema({
    question: {type: String, require: true},
    answer: String,
    account: {type: Schema.ObjectId, ref:'Account', require: true},
});

module.exports = mongoose.model('SecurityQuestion', securityQuestionSchema);