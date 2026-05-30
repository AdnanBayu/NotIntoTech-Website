// Controller for the data request form submission.

const Request = require('../models/mongo/Request');

/*
 POST /request-form
 Save a data request to MongoDB and re-render the request page.
*/
exports.submitRequest = async (req, res) => {
  try {
    console.log('Received request data:', req.body);

    const newRequest = new Request({
      request_name: req.body['request-name'],
      request_email: req.body['request-email'],
      request_text: req.body['request-text'],
    });
    await newRequest.save();
    console.log('Request sent successfully');

    res.render('datasets/request-data', { message: 'Request sent!', error: null });
  } catch (err) {
    console.error('Error sending request:', err);
    res.status(500).render('datasets/request-data', { message: null, error: 'Error sending request' });
  }
};
