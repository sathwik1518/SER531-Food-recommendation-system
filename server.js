const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 4000;

const GRAPHDB_ENDPOINT = 'http://Deepanjays-MacBook-Pro.local:7200/repositories/projectMain';

app.use(cors());
app.use(express.json());

app.post('/api/nutrition', async (req, res) => {
  const { query } = req.body;

  const sparqlQueryDirect = `
    PREFIX ex: <http://www.semanticweb.org/pooja/ontologies/2024/10/deliverable2#>
    SELECT ?foodItem ?calories ?carbohydrates ?fat ?protein
    WHERE {
      ?foodItem a ex:Food ;
                ex:hasCalories ?calories ;
                ex:hasCarbohydrateContent ?carbohydrates ;
                ex:hasFatContent ?fat ;
                ex:hasProteinContent ?protein .
      FILTER regex(str(?foodItem), "${query}", "i")
    }
  `;

  const sparqlQueryIngredients = `
    PREFIX ex: <http://www.semanticweb.org/pooja/ontologies/2024/10/deliverable2#>
    SELECT ?ingredient
    WHERE {
      ?foodItem a ex:FoodItem ;
                ex:hasIngredient ?ingredient .
      FILTER regex(str(?foodItem), "${query}", "i")
    }
  `;

  const sparqlQueryIngredientNutrition = (ingredient) => `
    PREFIX ex: <http://www.semanticweb.org/pooja/ontologies/2024/10/deliverable2#>
    SELECT ?calories ?carbohydrates ?fat ?protein
    WHERE {
      ?ingredient a ex:Food ;
                  ex:hasCalories ?calories ;
                  ex:hasCarbohydrateContent ?carbohydrates ;
                  ex:hasFatContent ?fat ;
                  ex:hasProteinContent ?protein .
      FILTER regex(str(?ingredient), "${ingredient}", "i")
    }
  `;

  const sparqlQueryIngredientAlternatives = (ingredient) => `
    PREFIX ex: <http://www.semanticweb.org/pooja/ontologies/2024/10/deliverable2#>
    SELECT ?alternative
    WHERE {
      ?ingredient ex:hasAlternative ?alternative .
      FILTER regex(str(?ingredient), "${ingredient}", "i")
    }
  `;

  try {
    console.log('Fetching direct nutritional values for query:', query);
    let response = await axios.post(
      GRAPHDB_ENDPOINT,
      `query=${encodeURIComponent(sparqlQueryDirect)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log('Direct nutritional values response:', response.data);

    const results = response.data.results.bindings.map(binding => ({
      foodItem: binding.foodItem.value,
      calories: binding.calories.value,
      carbohydrates: binding.carbohydrates.value,
      fat: binding.fat.value,
      protein: binding.protein.value,
    }));

    let ingredients = [];

    if (results.length === 0) {
      console.log('No direct nutritional values found, fetching ingredients for query:', query);
      response = await axios.post(
        GRAPHDB_ENDPOINT,
        `query=${encodeURIComponent(sparqlQueryIngredients)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log('Ingredients response:', response.data);

      ingredients = response.data.results.bindings.map(binding => binding.ingredient.value);

      let totalCalories = 0;
      let totalCarbohydrates = 0;
      let totalFat = 0;
      let totalProtein = 0;

      for (const ingredient of ingredients) {
        const ingredientName = ingredient.split('#')[1];

        console.log('Fetching nutritional values for ingredient:', ingredientName);
        let ingredientResponse = await axios.post(
          GRAPHDB_ENDPOINT,
          `query=${encodeURIComponent(sparqlQueryIngredientNutrition(ingredientName))}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        console.log('Nutritional values response for ingredient:', ingredientName, ingredientResponse.data);

        let ingredientData = ingredientResponse.data.results.bindings[0];
        if (ingredientData) {
          totalCalories += parseFloat(ingredientData.calories.value);
          totalCarbohydrates += parseFloat(ingredientData.carbohydrates.value);
          totalFat += parseFloat(ingredientData.fat.value);
          totalProtein += parseFloat(ingredientData.protein.value);
          continue;
        }

        const ingredientWords = ingredientName.split('_');
        let ingredientFound = false;
        for (const word of ingredientWords.reverse()) {
          console.log('Fetching nutritional values for partial match word:', word);
          ingredientResponse = await axios.post(
            GRAPHDB_ENDPOINT,
            `query=${encodeURIComponent(sparqlQueryIngredientNutrition(word))}`,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          );
          console.log('Nutritional values response for partial match word:', word, ingredientResponse.data);

          ingredientData = ingredientResponse.data.results.bindings[0];
          if (ingredientData) {
            totalCalories += parseFloat(ingredientData.calories.value);
            totalCarbohydrates += parseFloat(ingredientData.carbohydrates.value);
            totalFat += parseFloat(ingredientData.fat.value);
            totalProtein += parseFloat(ingredientData.protein.value);
            ingredientFound = true;
            break;
          }
        }

        if (!ingredientFound) {
          console.warn(`Nutritional data not found for ingredient: ${ingredientName}`);
        }
      }

      results.push({
        foodItem: query,
        calories: totalCalories,
        carbohydrates: totalCarbohydrates,
        fat: totalFat,
        protein: totalProtein,
      });
    }

    const alternativeIngredients = [];
    if (ingredients.length > 0) {
      for (const ingredient of ingredients) {
        const ingredientName = ingredient.split('#')[1];
        console.log('Fetching alternatives for ingredient:', ingredientName);
        const alternativeResponse = await axios.post(
          GRAPHDB_ENDPOINT,
          `query=${encodeURIComponent(sparqlQueryIngredientAlternatives(ingredientName))}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        console.log('Alternatives response for ingredient:', ingredientName, alternativeResponse.data);

        const alternatives = alternativeResponse.data.results.bindings.map(binding => ({
          ingredient: ingredientName,
          alternative: binding.alternative.value.split('#')[1],
        }));

        alternativeIngredients.push(...alternatives);
      }
    }

    console.log('Results:', results);
    console.log('Alternative Ingredients:', alternativeIngredients);

    res.json({ combinedResults: results, alternatives: alternativeIngredients });
  } catch (error) {
    console.error('Error fetching nutritional data:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch nutritional data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
