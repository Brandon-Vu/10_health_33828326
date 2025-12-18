const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Show meals with daily and weekly summary
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/loginn');

  try {
    const userId = req.session.user.id;

    // Fetch meals
    const [meals] = await db.execute(
      'SELECT id, meal_name, calories, meal_date FROM meals WHERE user_id = ? ORDER BY meal_date DESC',
      [userId]
    );

    // Today's summary
    const [todaySummary] = await db.execute(
      `SELECT COUNT(*) AS mealCount, SUM(calories) AS totalCalories
       FROM meals
       WHERE user_id = ? AND meal_date = CURDATE()`,
      [userId]
    );

    // Weekly summary (past 7 days)
    const [weekSummary] = await db.execute(
      `SELECT COUNT(*) AS mealCount, SUM(calories) AS totalCalories
       FROM meals
       WHERE user_id = ? AND meal_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()`,
      [userId]
    );

    res.render('meals', {
      session: req.session,
      meals,
      todaySummary: todaySummary[0],
      weekSummary: weekSummary[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load meals.');
  }
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

// Search meals
router.get('/search', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const query = req.query.q || '';
  const [meals] = await db.execute(
    `SELECT * FROM meals 
     WHERE user_id = ? AND meal_name LIKE ? 
     ORDER BY meal_date DESC`,
    [req.session.user.id, `%${query}%`]
  );

  res.render('search', { meals });
});

module.exports = router;
