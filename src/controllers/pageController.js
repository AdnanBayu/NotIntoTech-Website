// Controller for simple static page renders.
// Pages that only call res.render() with no data fetching belong here.

/*
 GET /
 Render the home page.
*/
exports.showHome = (req, res) => {
  res.render('index', { message: null, error: null });
};

/*
 GET /chatbot
 Render the chatbot page.
*/
exports.showChatbot = (req, res) => {
  res.render('chatbot/page-chatbot', { message: null, error: null });
};

/*
 GET /dashboard
 Render the dashboard page.
*/
exports.showDashboard = (req, res) => {
  res.render('dashboard/page-dashboard', { message: null, error: null });
};

/*
 GET /profile
 Render the profile page.
*/
exports.showProfile = (req, res) => {
  res.render('page-profile', { message: null, error: null });
};

/*
 GET /request
 Render the data request page.
*/
exports.showRequest = (req, res) => {
  res.render('datasets/request-data', { message: null, error: null });
};

/*
 GET /coming-soon
 Render the coming-soon page.
*/
exports.showComingSoon = (req, res) => {
  res.render('coming-soon/coming-soon', { message: null, error: null });
};

/*
 GET /error
 Render the error page.
*/
exports.showError = (req, res) => {
  res.render('error/error', { message: 'An error occurred', error: null });
};
