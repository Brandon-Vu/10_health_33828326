require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');

const app = express();
const PORT = 8000;

const apiRoutes = require('./routes/api');

// Middleware
app.use('/api', apiRoutes);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Make session available in templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes);
app.use('/meals', mealRoutes);

// About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Start server
app.listen(PORT, () => {
  console.log(`NutriLog running at ${process.env.HEALTH_BASE_PATH}`);
});