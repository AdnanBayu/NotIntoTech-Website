// used by vercel

require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('../src/database/mongodbClient');
const router = require('../src/routes/router');
const chatbotApiRouter = require('../src/routes/chatbotApiRouter');
const swaggerSetup = require('../src/swagger');

const app = express();

// Connect to database
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../src/public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

swaggerSetup(app);

app.use('/', chatbotApiRouter);
app.use('/', router);

app.get('/debug-env', (req, res) => {
  const url = process.env.DATABASE_URL;
  res.json({
    exists: !!url,
    startsCorrectly: url?.startsWith('postgresql://') || url?.startsWith('postgres://'),
    preview: url ? url.substring(0, 30) + '...' : 'MISSING'
  });
});

app.use((req, res) => {
    res.status(404).redirect('/error');
});

module.exports = app;