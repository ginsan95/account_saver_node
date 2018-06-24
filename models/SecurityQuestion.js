const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const securityQuestionSchema = Schema({
    question: {type: String, require: true},
    answer: String
});

module.exports = mongoose.model('SecurityQuestion', securityQuestionSchema);