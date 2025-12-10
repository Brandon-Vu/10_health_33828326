const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Show form to log a meal
router.get('/new', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('log_meal');
});

// Handle meal submission
router.post('/', async (req, res) => {
  const { meal_name, meal_date, calories } = req.body;
  const user_id = req.session.user.id;
  try {
    await db.execute(
      'INSERT INTO meals (user_id, meal_name, meal_date, calories) VALUES (?, ?, ?, ?)',
      [user_id, meal_name, meal_date, calories]
    );
    res.redirect('/meals');
  } catch (err) {
    console.error(err);
    res.send('Error saving meal');
  }
});

// Show all meals for the user
router.get('/', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const [meals] = await db.execute(
      'SELECT id, meal_name, calories, meal_date FROM meals WHERE user_id = ? ORDER BY meal_date DESC',
      [req.session.user.id]
    );

    res.render('meals', { session: req.session, meals });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load meals.');
  }
});

// Show edit form
router.get('/edit/:id', async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM meals WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.user.id]
  );
  if (!rows.length) return res.redirect('/meals');
  res.render('edit_meal', { meal: rows[0] });
});

// Handle edit submission
router.post('/edit/:id', async (req, res) => {
  const { meal_name, meal_date, calories } = req.body;
  await db.execute(
    'UPDATE meals SET meal_name = ?, meal_date = ?, calories = ? WHERE id = ? AND user_id = ?',
    [meal_name, meal_date, calories, req.params.id, req.session.user.id]
  );
  res.redirect('/meals');
});

// Handle meal deletion
router.post('/delete/:id', async (req, res) => {
  await db.execute(
    'DELETE FROM meals WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.user.id]
  );
  res.redirect('/meals');
});

// Export the router
module.exports = router;