"use client";

import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { IncomingMessage } from 'http';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

const GRAPHDB_ENDPOINT = 'http://localhost:7200/repositories/your-repository-name';

function recognizeFood(imagePath: string): string {
  return path.basename(imagePath).includes('pizza') ? 'pizza' : 'salad';
}

async function fetchNutritionInfo(foodName: string) {
  const sparqlQuery = `
    PREFIX deliverable2: <http://www.semanticweb.org/pooja/ontologies/2024/10/deliverable2#>
    SELECT ?calories ?proteins ?carbohydrates ?fats ?healthySuggestions
    WHERE {
      ?foodItem a deliverable2:FoodItem ;
                deliverable2:hasTotalCalories ?calories ;
                deliverable2:hasTotalProtein ?proteins ;
                deliverable2:hasTotalCarbohydrates ?carbohydrates ;
                deliverable2:hasTotalFat ?fats ;
                deliverable2:hasHealthySuggestions ?healthySuggestions .
      FILTER regex(str(?foodItem), "${foodName}", "i")
    }
  `;
  try {
    const response = await axios.post(
      GRAPHDB_ENDPOINT,
      `query=${encodeURIComponent(sparqlQuery)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.results.bindings[0];
  } catch (error) {
    console.error('Error fetching nutritional data:', error);
    throw new Error('Failed to fetch nutritional data');
  }
}

export async function POST(req: NextRequest) {
  const reqMessage = req as unknown as IncomingMessage;

  const form = new formidable.IncomingForm();

  (form as any).uploadDir = path.join(process.cwd(), 'public', 'uploads');
  (form as any).keepExtensions = true;

  return new Promise((resolve, reject) => {
    form.parse(reqMessage, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing the form:", err);
        return resolve(NextResponse.json({ error: 'Image upload failed' }, { status: 500 }));
      }

      const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

      if (!imageFile) {
        return resolve(NextResponse.json({ error: 'No image file uploaded' }, { status: 400 }));
      }

      try {
        const foodName = recognizeFood(imageFile.filepath);

        const nutritionInfo = await fetchNutritionInfo(foodName);

        if (!nutritionInfo) {
          return resolve(NextResponse.json({ error: 'Food not recognized' }, { status: 404 }));
        }

        resolve(NextResponse.json({
          foodName,
          calories: nutritionInfo.calories.value,
          proteins: nutritionInfo.proteins.value,
          carbohydrates: nutritionInfo.carbohydrates.value,
          fats: nutritionInfo.fats.value,
          healthySuggestions: nutritionInfo.healthySuggestions.value.split(',')
        }));
      } catch (error) {
        console.error('Food analysis error:', error);
        resolve(NextResponse.json({ error: 'Food analysis failed' }, { status: 500 }));
      }
    });
  });
}
