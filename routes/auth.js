const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const router = express.Router();

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// Registration route
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  console.log('REGISTER BODY:', req.body);

  if (!username || !email || !password) {
    return res.render('register', { error: 'Missing username, email, or password (req.body is empty or form names are wrong).' });
  }

  if (!passwordRegex.test(password)) {
    return res.render('register', {
      error: 'Password must be at least 8 characters and include 1 lowercase, 1 uppercase, 1 number, and 1 special character.'
    });
  }

  try {
    await db.execute('SELECT 1');

    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );

    return res.redirect('/login');

  } catch (err) {
    console.error('REGISTER ERROR:', err);

    const details = err.code || err.message || 'Unknown error';

    if (err.code === 'ER_DUP_ENTRY') {
      return res.render('register', { error: 'Duplicate: username or email already exists (ER_DUP_ENTRY).' });
    }

    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.render('register', { error: 'DB auth failed (ER_ACCESS_DENIED_ERROR). Check DB user/password in .env and db.js.' });
    }

    if (err.code === 'ER_BAD_DB_ERROR') {
      return res.render('register', { error: 'Database not found (ER_BAD_DB_ERROR). Check DB name in .env.' });
    }

    return res.render('register', { error: `Register failed: ${details}` });
  }
});

// Login route
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Home route
router.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/meals');
  } else {
    res.redirect('/login');
  }
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