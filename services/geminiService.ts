import { GoogleGenAI } from "@google/genai";
import { Place, Category, GeoLocation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchNearbyPlaces = async (location: GeoLocation, radius: number): Promise<Place[]> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      I am at latitude: ${location.lat}, longitude: ${location.lng}.
      Find 20 popular "Street Food/Snack Shops" (小吃, 鹽酥雞, 雞排, 滷味) and "Bubble Tea/Beverage Shops" (手搖飲, 咖啡, 茶飲) within ${radius}km.

      Strict Filtering Criteria:
      1. PRIORITY: Include popular chains known to accept "LINE Pay" (e.g., 50嵐, 可不可, 迷客夏, 派克雞排, 八方雲集) or modern snack shops with mobile payment support.
      2. Exclude large sit-down restaurants unless they are very popular cheap eats. Focus on "Takeout" or "Quick Bites".

      Output Format Rules:
      - Use the Google Maps tool to verify existence and location.
      - Output exactly one line per place using "||" as a separator.
      - Format: Name || Category (must be "Food" or "Drink") || Rating (number) || Status (Open/Closed) || Address || Estimated Distance (e.g. 0.3 km)
      - For "Category": Use "Drink" for any tea/coffee/juice shop. Use "Food" for everything else.
      - Calculate the approximate distance from my coordinates provided above.
      - Do not include markdown bolding (**).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        }
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const places: Place[] = [];
    const lines = text.split('\n');

    lines.forEach((line, index) => {
      // Remove any leading numbering like "1. "
      const cleanLine = line.replace(/^\d+[\.\)]\s*/, '').trim();
      const parts = cleanLine.split('||').map(p => p.trim());
      
      if (parts.length >= 5) {
        const [name, catStr, ratingStr, statusStr, address, distanceStr] = parts;
        
        let category = Category.FOOD;
        const lowerCat = catStr.toLowerCase();
        if (lowerCat.includes('drink') || lowerCat.includes('beverage') || lowerCat.includes('tea') || lowerCat.includes('coffee') || lowerCat.includes('cafe')) {
          category = Category.DRINK;
        }

        const rating = parseFloat(ratingStr) || 0;
        const isOpen = statusStr.toLowerCase().includes('open') || statusStr.includes('營業中');

        // Clean up distance string (ensure it has 'km' or 'm')
        let distance = distanceStr || '';
        if (distance && !distance.match(/[kK]?[mM]/)) {
            distance += ' km';
        }

        // Try to find a specific Google Maps link
        let sourceUri = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + address)}`;
        const matchingChunk = groundingChunks.find(chunk => 
          (chunk.web?.title && name.includes(chunk.web.title)) || 
          (chunk.web?.uri && chunk.web.uri.includes(encodeURIComponent(name)))
        );
        if (matchingChunk && matchingChunk.web?.uri) {
            sourceUri = matchingChunk.web.uri;
        }

        places.push({
          id: `place-${index}-${Date.now()}`,
          name,
          category,
          rating,
          isOpen,
          address,
          distance,
          sourceUri
        });
      }
    });

    return places;

  } catch (error) {
    console.error("Error fetching places from Gemini:", error);
    throw error;
  }
};