require('dotenv').config();
const express = require('express');
const router = express.Router();

const APP_ID = process.env.EDAMAM_APP_ID;
const APP_KEY = process.env.EDAMAM_APP_KEY;


router.get('/food-info', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const parseURL = `https://api.edamam.com/api/food-database/v2/parser?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(query)}`;
    const parseRes = await fetch(parseURL);

    if (parseRes.status === 429) {
      console.warn('Parse request failed with status: 429');
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    const parseData = await parseRes.json();
    const hint = parseData.hints?.[0];
    if (!hint) return res.json({ calories: 0 });

    const food = hint.food;
    const measure = hint.measures.find(m => m.label === 'Serving') || hint.measures[0];
    const quantity = parseData.parsed?.[0]?.quantity || 1;

    const nutrientsRes = await fetch(`https://api.edamam.com/api/food-database/v2/nutrients?app_id=${APP_ID}&app_key=${APP_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: [{
          quantity,
          measureURI: measure.uri,
          foodId: food.foodId
        }]
      })
    });

    if (nutrientsRes.status === 429) {
      console.warn('Nutrients request failed with status: 429');
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    const nutrientsData = await nutrientsRes.json();
    res.json({ calories: nutrientsData.calories || 0 });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Failed to fetch calories' });
  }
});

module.exports = router;