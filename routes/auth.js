const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const router = express.Router();

// Registration route
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hash]);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Username or email already exists.' });
  }
});

// Login route
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];
    if (user && await bcrypt.compare(password, user.password_hash)) {
      req.session.user = { id: user.id, username: user.username };
      res.redirect('/meals');
    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Something went wrong.' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;