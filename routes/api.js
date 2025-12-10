const express = require('express');
const router = express.Router();
const { getCaloriesFromInput } = require('../utils/edamam');

router.get('/food-info', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Missing food query.' });
  }

  const result = await getCaloriesFromInput(query);

  if (result.error) {
    return res.status(500).json({ error: result.error });
  }

  res.json({ calories: result.calories });
});

module.exports = router;