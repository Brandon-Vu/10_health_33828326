require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const APP_ID = process.env.EDAMAM_APP_ID;
const APP_KEY = process.env.EDAMAM_APP_KEY;

function parseQuantityAndFood(input) {
  const raw = (input || '').trim();

  const m = raw.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (!m) return { quantity: 1, foodText: raw };

  const quantity = Number(m[1]);
  const foodText = m[2].trim();

  return {
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    foodText
  };
}

router.get('/food-info', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  if (!APP_ID || !APP_KEY) {
    return res.status(500).json({ error: 'Missing EDAMAM_APP_ID or EDAMAM_APP_KEY in .env' });
  }

  const { quantity, foodText } = parseQuantityAndFood(query);

  try {
    const parseURL =
      `https://api.edamam.com/api/food-database/v2/parser` +
      `?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(foodText)}`;

    const parseRes = await fetch(parseURL);
    const parseText = await parseRes.text();

    if (parseRes.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    if (!parseRes.ok) {
      console.error('Parser failed:', parseRes.status, parseText.slice(0, 300));
      return res.status(502).json({ error: 'Edamam parser request failed' });
    }

    const parseData = JSON.parse(parseText);
    const hint = parseData.hints?.[0];
    if (!hint) return res.json({ calories: 0 });

    const food = hint.food;
    const measures = hint.measures || [];
    const measure = measures.find(m => m.label === 'Serving') || measures[0];

    if (!food?.foodId || !measure?.uri) return res.json({ calories: 0 });

    const nutrientsURL =
      `https://api.edamam.com/api/food-database/v2/nutrients?app_id=${APP_ID}&app_key=${APP_KEY}`;

    const nutrientsRes = await fetch(nutrientsURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: [{
          quantity: quantity,
          measureURI: measure.uri,
          foodId: food.foodId
        }]
      })
    });

    const nutrientsText = await nutrientsRes.text();

    if (nutrientsRes.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    if (!nutrientsRes.ok) {
      console.error('Nutrients failed:', nutrientsRes.status, nutrientsText.slice(0, 300));
      return res.status(502).json({ error: 'Edamam nutrients request failed' });
    }

    const nutrientsData = JSON.parse(nutrientsText);

    return res.json({ calories: nutrientsData.calories || 0 });

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Failed to fetch calories' });
  }
});

module.exports = router;