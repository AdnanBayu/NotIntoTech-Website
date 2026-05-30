const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema(
  {
    request_name: {
      type: String,
      required: true,
    },
    request_email: {
      type: String,
      required: true,
    },
    request_text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'requestusers',
  }
);

module.exports = mongoose.model('RequestUser', requestSchema);
