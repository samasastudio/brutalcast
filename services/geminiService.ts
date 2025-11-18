import { GoogleGenAI, Type } from "@google/genai";
import type { WeatherData, GeneratedLayout, Unit } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const uiGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        blurb: {
            type: Type.STRING,
            description: "A cheeky, one-sentence summary of the weather comparison. Should be witty and engaging."
        },
        imagePrompt: {
            type: Type.STRING,
            description: "A creative, descriptive prompt for an image generation model. The prompt MUST describe a 2D vector illustration with a flat design aesthetic. The style must be bold, colorful, and graphic, matching the website's brutalist UI. It must use a limited, high-contrast color palette dominated by black, white, and a vibrant yellow (#facc15). The illustration should feature clean lines, hard shadows, no gradients, and abstract geometric shapes to represent the weather. Avoid any realistic, 3D, or photographic styles. The final image should feel like a modern screen print or vector art poster. E.g., 'A minimalist 2D vector illustration of Tokyo's sun as a solid yellow circle over heavy black geometric blocks, contrasted with London's rain represented by stark white diagonal lines. Flat design with hard shadows, no gradients, in a brutalist poster style.'"
        },
        uiComponents: {
            type: Type.ARRAY,
            description: "An array of UI component configurations to display the data.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: {
                        type: Type.STRING,
                        description: "The type of UI component to render. Options: 'TABLE', 'CARD', 'BAR_CHART', 'LINE_CHART', 'SCATTER_CHART'.",
                        enum: ['TABLE', 'CARD', 'BAR_CHART', 'LINE_CHART', 'SCATTER_CHART']
                    },
                    title: {
                        type: Type.STRING,
                        description: "A descriptive title for the UI component."
                    },
                    props: {
                        type: Type.OBJECT,
                        description: "An object containing the necessary properties for the component. For charts, select appropriate keys for axes. For tables and cards, select relevant data points and cities to show.",
                        properties: {
                            cities: {
                                type: Type.ARRAY,
                                description: "An array of city names to be displayed in the component. Used by TABLE, CARD, and LINE_CHART.",
                                items: { type: Type.STRING }
                            },
                            dataKeys: {
                                type: Type.ARRAY,
                                description: "An array of data keys (e.g., 'temp', 'humidity') to be plotted or displayed. Used by TABLE, BAR_CHART.",
                                items: { type: Type.STRING }
                            },
                            xAxisKey: {
                                type: Type.STRING,
                                description: "The data key to use for the X-axis. Used by SCATTER_CHART and LINE_CHART."
                            },
                            yAxisKey: {
                                type: Type.STRING,
                                description: "The data key to use for the Y-axis. Used by SCATTER_CHART and LINE_CHART."
                            },
                            zAxisKey: {
                                type: Type.STRING,
                                description: "The data key to use for the Z-axis (bubble size). Used by SCATTER_CHART."
                            }
                        }
                    }
                },
                required: ['type', 'title', 'props']
            }
        }
    },
    required: ['blurb', 'imagePrompt', 'uiComponents']
};

export async function generateUiLayout(weatherData: Record<string, WeatherData>, userPrompt: string, unit: Unit): Promise<GeneratedLayout> {
  const weatherDataString = JSON.stringify(Object.values(weatherData), null, 2);
  
  const unitInstructions = `
    The current unit system is '${unit}'.
    - For 'imperial' units, temperature is in Fahrenheit (°F) and wind speed is in miles per hour (mph).
    - For 'metric' units, temperature is in Celsius (°C) and wind speed is in meters per second (m/s).
    IMPORTANT: Please ensure that any titles or labels you generate for the UI components reflect this. For example, a chart title should be 'Temperature Comparison (°F)' if the unit is imperial.
  `;

  let generationInstructions: string;
  if (userPrompt.trim()) {
    generationInstructions = `
      The user has provided a specific request for the UI layout.
      IMPORTANT: You MUST generate ONLY the components described in the user's request. Do NOT add any extra components.
      Fulfill their request as accurately as possible.
      User's request: "${userPrompt}"
    `;
  } else {
    generationInstructions = `
      The user has not specified a layout. Please generate a diverse and interesting layout automatically.
      Your response should include 3 to 5 different UI components to compare the weather data in interesting ways.
      - For charts, choose data keys that make for an interesting comparison.
      - For tables, select a few key columns.
      - For cards, select a few cities to highlight. Ensure the 'cities' prop is an array of city name strings.
    `;
  }

  const prompt = `
    Analyze the following weather data for several cities and generate a UI layout configuration.
    Your response MUST be a valid JSON object matching the provided schema.

    The weather data now includes a 'forecast' field, which is an array of daily predictions for the next 5 days. Each forecast item has: 'day', 'temp', 'humidity', and 'chance_of_rain'.

    ${unitInstructions}

    ${generationInstructions}

    Regardless of the mode, remember these global rules:
    - The 'blurb' should be a single, witty sentence that summarizes the weather comparison.
    - The 'imagePrompt' MUST describe a 2D vector illustration with a flat design. The style must be bold and graphic, using a limited color palette of black, white, and vibrant yellow (#facc15) to match the UI. It should have clean lines, hard shadows, no gradients, and feel like a modern screen print or vector art poster. Avoid 3D or photographic styles.
    
    Component-specific rules:
    - BAR_CHART: Use 'dataKeys' to select metrics from the main weather object.
    - SCATTER_CHART: Use 'xAxisKey', 'yAxisKey', 'zAxisKey' for metrics from the main weather object.
    - LINE_CHART: This chart is for visualizing relationships in the 5-day forecast. You MUST provide 'xAxisKey' and 'yAxisKey' from the forecast data fields ('temp', 'humidity', 'chance_of_rain'). You must also provide a 'cities' array. Do NOT use 'dataKeys' for LINE_CHART.
    - TABLE/CARD: Use 'cities' to select which cities to display. For TABLE, also provide 'dataKeys'.

    Weather Data:
    ${weatherDataString}
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: uiGenerationSchema,
        },
    });

    const jsonText = response.text.trim();
    const layout = JSON.parse(jsonText);
    
    // Basic validation
    if (!layout.blurb || !layout.imagePrompt || !Array.isArray(layout.uiComponents)) {
      throw new Error("Invalid layout structure received from AI.");
    }
    
    return layout as GeneratedLayout;

  } catch (error) {
    console.error("Error generating UI layout:", error);
    throw new Error("Failed to generate UI layout from AI. The model may have returned an unexpected format.");
  }
}

export async function generateImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate the weather visualization image.");
    }
}