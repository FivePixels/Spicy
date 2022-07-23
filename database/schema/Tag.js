const { Schema } = require('mongoose');

const tagSchema = new Schema({
    name: String,
    content: String,
    attachmentURL: String
});

module.exports = { tagSchema };

