require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');

const app = express();
const PORT = 8000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes);
app.use('/meals', mealRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`NutriLog running at ${process.env.HEALTH_BASE_PATH}`);
});