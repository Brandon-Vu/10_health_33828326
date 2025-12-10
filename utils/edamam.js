const APP_ID = process.env.EDAMAM_APP_ID;
const APP_KEY = process.env.EDAMAM_APP_KEY;

// Function to get calories from Edamam API based on user input
async function getCaloriesFromInput(input) {
  const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(input)}`;

  try {
    const parseRes = await fetch(url);
    const parseData = await parseRes.json();

    if (!parseData.hints || parseData.hints.length === 0) {
      return { error: 'Food not recognized.' };
    }

    const food = parseData.hints[0].food;
    const measure = parseData.hints[0].measures.find(m => m.label === 'Serving') || parseData.hints[0].measures[0];
    const quantity = parseData.parsed?.[0]?.quantity || 1;

    const nutrientsUrl = `https://api.edamam.com/api/food-database/v2/nutrients?app_id=${APP_ID}&app_key=${APP_KEY}`;
    const nutrientsRes = await fetch(nutrientsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: [
          {
            quantity: quantity,
            measureURI: measure.uri,
            foodId: food.foodId
          }
        ]
      })
    });

    const nutrition = await nutrientsRes.json();
    return { calories: nutrition.calories ?? null };

  } catch (err) {
    return { error: err.message };
  }
}

module.exports = { getCaloriesFromInput };
