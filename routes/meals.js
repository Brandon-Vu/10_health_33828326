const express = require('express');
const router = express.Router();

// Meal dashboard route 
router.get('/', (req, res) => {
  res.send('Meal dashboard coming soon...');
});

module.exports = router;