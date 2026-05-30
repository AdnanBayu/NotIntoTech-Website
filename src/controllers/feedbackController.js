// Controller for the feedback form submission.

const Feedback = require('../models/mongo/Feedback');

/*
 POST /feedback-form
 Save feedback to MongoDB and re-render the home page.
*/
exports.submitFeedback = async (req, res) => {
  try {
    console.log('Received feedback data:', req.body);

    const newFeedback = new Feedback({
      feedback_name: req.body['feedback-name'],
      feedback_email: req.body['feedback-email'],
      feedback_text: req.body['feedback-text'],
    });
    await newFeedback.save();
    console.log('Feedback sent successfully');

    res.render('index', { message: 'Feedback sent!', error: null });
  } catch (err) {
    console.error('Error sending feedback:', err);
    res.status(500).render('index', { message: null, error: 'Error sending feedback' });
  }
};
