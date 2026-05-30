const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    feedback_name: {
      type: String,
      required: true,
    },
    feedback_email: {
      type: String,
      required: true,
    },
    feedback_text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'feedbackusers',
  }
);

module.exports = mongoose.model('FeedbackUser', feedbackSchema);