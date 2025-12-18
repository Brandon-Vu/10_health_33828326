require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const APP_ID = process.env.EDAMAM_APP_ID;
const APP_KEY = process.env.EDAMAM_APP_KEY;

router.get('/food-info', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  if (!APP_ID || !APP_KEY) {
    return res.status(500).json({ error: 'Missing EDAMAM_APP_ID or EDAMAM_APP_KEY in .env' });
  }

  try {
    const parseURL =
      `https://api.edamam.com/api/food-database/v2/parser` +
      `?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(query)}`;

    const parseRes = await fetch(parseURL);
    const parseText = await parseRes.text(); 

    if (parseRes.status === 429) {
      console.warn('Edamam parser rate limit (429)');
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    if (!parseRes.ok) {
      console.error('Edamam parser failed:', parseRes.status, parseText.slice(0, 300));
      return res.status(502).json({ error: 'Edamam parser request failed' });
    }

    const parseData = JSON.parse(parseText);

    const hint = parseData.hints?.[0];
    if (!hint) return res.json({ calories: 0 });

    const food = hint.food;
    const measure = hint.measures?.find(m => m.label === 'Serving') || hint.measures?.[0];

    if (!food?.foodId || !measure?.uri) {
      return res.json({ calories: 0 });
    }
    const nutrientsURL =
      `https://api.edamam.com/api/food-database/v2/nutrients?app_id=${APP_ID}&app_key=${APP_KEY}`;

    const nutrientsRes = await fetch(nutrientsURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: [{
          quantity: 1,
          measureURI: measure.uri,
          foodId: food.foodId
        }]
      })
    });

    const nutrientsText = await nutrientsRes.text();

    if (nutrientsRes.status === 429) {
      console.warn('Edamam nutrients rate limit (429)');
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    if (!nutrientsRes.ok) {
      console.error('Edamam nutrients failed:', nutrientsRes.status, nutrientsText.slice(0, 300));
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