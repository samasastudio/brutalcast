import { GoogleGenAI, Type } from "@google/genai";
import type { WeatherData, GeneratedLayout, Unit } from '../types';

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
                                description: "An array of data keys (e.g., 'temp', 'humidity', 'aqi', 'chance_of_rain') to be plotted or displayed. Used by TABLE, BAR_CHART, and CARD. For CARD, only show the fields specified in dataKeys. For chance_of_rain, use the forecast data.",
                                items: { type: Type.STRING }
                            },
                            xAxisKey: {
                                type: Type.STRING,
                                description: "The data key to use for the X-axis. For LINE_CHART, must be one of: 'day', 'temp', 'humidity', 'chance_of_rain' (from forecast data). For SCATTER_CHART, use keys from main weather object."
                            },
                            yAxisKey: {
                                type: Type.STRING,
                                description: "The data key to use for the Y-axis. For LINE_CHART, must be one of: 'day', 'temp', 'humidity', 'chance_of_rain' (from forecast data). For SCATTER_CHART, use keys from main weather object."
                            },
                            zAxisKey: {
                                type: Type.STRING,
                                description: "The data key to use for the Z-axis (bubble size). Used by SCATTER_CHART."
                            },
                            limitDays: {
                                type: Type.INTEGER,
                                description: "Optional. The number of days to show in the forecast line chart (1-5). Default is 5. Used by LINE_CHART."
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

export async function generateUiLayout(weatherData: Record<string, WeatherData>, userPrompt: string, unit: Unit, apiKey: string): Promise<GeneratedLayout> {
    // STRICT API Key Sanitization: Only allow alphanumeric and standard symbols (-_.)
    // This fixes "Failed to execute 'append' on 'Headers': String contains non ISO-8859-1 code point"
    const cleanApiKey = apiKey.trim().replace(/[^a-zA-Z0-9\-\_\.]/g, '');
    
    if (cleanApiKey.length === 0) {
        throw new Error("Invalid API Key provided. Please check your key.");
    }
    
    const ai = new GoogleGenAI({ apiKey: cleanApiKey });
    const weatherDataString = JSON.stringify(Object.values(weatherData), null, 2);
    
    // Sanitize user prompt to remove any problematic characters
    const sanitizedUserPrompt = userPrompt.replace(/[^\x00-\x7F]/g, (char) => {
        // Replace common non-ASCII characters with ASCII equivalents
        const replacements: Record<string, string> = {
            '°': ' degrees ',
            '–': '-',
            '—': '-',
            '"': '"',
            '"': '"',
            "'": "'",
            "'": "'",
        };
        return replacements[char] || '';
    });

    const unitInstructions = `
    The current unit system is '${unit}'.
    - For 'imperial' units, temperature is in Fahrenheit (F) and wind speed is in miles per hour (mph).
    - For 'metric' units, temperature is in Celsius (C) and wind speed is in meters per second (m/s).
    IMPORTANT: Please ensure that any titles or labels you generate for the UI components reflect this. For example, a chart title should be 'Temperature Comparison (F)' if the unit is imperial.
  `;

    let generationInstructions: string;
    if (sanitizedUserPrompt.trim()) {
        generationInstructions = `
      The user has provided a specific request for the UI layout.
      IMPORTANT: You MUST generate ONLY the components described in the user's request. Do NOT add any extra components.
      Fulfill their request as accurately as possible.
      
      User's request: "${sanitizedUserPrompt}"
      
      SPECIAL INSTRUCTIONS FOR LINE_CHART REQUESTS:
      - If the user asks for a line chart showing a metric over time/days, use LINE_CHART with:
        * xAxisKey: "day" (to show progression over the forecast days)
        * yAxisKey: the metric they requested (e.g., "chance_of_rain", "temp", "humidity")
        * cities: include ALL cities from the weather data
      - Example: "line chart of chance of rain" → LINE_CHART with xAxisKey="day", yAxisKey="chance_of_rain", cities=[all cities]
      
      SPECIAL INSTRUCTIONS FOR CARD REQUESTS:
      - If the user requests cards showing specific fields (e.g., "cards showing air quality and humidity"), you MUST include a 'dataKeys' array with ONLY those fields.
      - Example: "cards showing air quality and humidity" → CARD with dataKeys=["aqi", "humidity"], cities=[all cities]
      - Example: "cards showing chance of rain" → CARD with dataKeys=["chance_of_rain"], cities=[all cities]
      - Do NOT include fields that were not requested. If the user asks for specific fields, only show those fields.
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

    /* ============================================
       PRESENTATION MARKER #3: LLM INPUT PROMPT
       ============================================
       This is the complete prompt sent to the LLM. It includes:
       - The user's layout request
       - The weather data (JSON)
       - The schema definition (responseSchema)
       - Component-specific rules and constraints
       - Unit system instructions
    */
    const prompt = `
    Analyze the following weather data for several cities and generate a UI layout configuration.
    Your response MUST be a valid JSON object matching the provided schema.

    The weather data includes a 'forecast' field, which is an array of daily predictions for the next 5 days. 
    It also includes an 'aqi' field (1=Good, 5=Poor).
    Each forecast item has the following structure:
    {
      "day": "Mon" (or "Tue", "Wed", etc. - day name),
      "temp": 75 (temperature number),
      "humidity": 65 (humidity percentage number),
      "chance_of_rain": 30 (chance of rain percentage number, 0-100)
    }
    When creating a LINE_CHART, you must use these exact field names from the forecast array.

    ${unitInstructions}

    ${generationInstructions}

    Regardless of the mode, remember these global rules:
    - The 'blurb' should be a single, witty sentence that summarizes the weather comparison.
    - The 'imagePrompt' MUST describe a 2D vector illustration with a flat design. The style must be bold and graphic, using a limited color palette of black, white, and vibrant yellow (#facc15) to match the UI. It should have clean lines, hard shadows, no gradients, and feel like a modern screen print or vector art poster. Avoid 3D or photographic styles.
    - **CRITICAL**: Unless the user explicitly requests a specific subset of cities, you MUST include ALL available cities from the data in the 'cities' prop for every component (TABLE, CARD, CHARTS). Do not arbitrarily pick just one city. We want to compare them all.
    
    Component-specific rules:
    - BAR_CHART: Use 'dataKeys' to select metrics from the main weather object.
    - SCATTER_CHART: Use 'xAxisKey', 'yAxisKey', 'zAxisKey' for metrics from the main weather object.
    - LINE_CHART: This chart is for visualizing forecast data over time. You MUST provide:
      * 'xAxisKey': Should be 'day' to show progression over days (the forecast array has 'day' as the first field)
      * 'yAxisKey': One of 'temp', 'humidity', or 'chance_of_rain' from the forecast data
      * 'cities': Array of city names to include in the chart
      * Do NOT use 'dataKeys' for LINE_CHART. The forecast data structure is: { day: string, temp: number, humidity: number, chance_of_rain: number }
    - TABLE/CARD: Use 'cities' to select which cities to display. For both TABLE and CARD, provide 'dataKeys' to specify which fields to show. 
      * For CARD: Only display the fields specified in dataKeys - do not show all fields. If the user requests "chance of rain", include 'chance_of_rain' in dataKeys (this comes from the forecast data, specifically the first forecast day).
      * For TABLE: Provide dataKeys to specify which columns to display.

    Weather Data:
    ${weatherDataString}
  `;

    console.log('[LLM] Prompt being sent to Gemini:', prompt);

    try {
        // Create a deep copy of the schema and sanitize all string descriptions
        // to ensure no non-ASCII characters cause header encoding issues
        const sanitizeSchema = (obj: any): any => {
            if (typeof obj === 'string') {
                // Replace any non-ASCII characters with ASCII equivalents
                return obj.replace(/[^\x00-\x7F]/g, (char) => {
                    const replacements: Record<string, string> = {
                        '°': ' degrees ',
                        '–': '-',
                        '—': '-',
                        '"': '"',
                        '"': '"',
                        "'": "'",
                        "'": "'",
                    };
                    return replacements[char] || '';
                });
            }
            if (Array.isArray(obj)) {
                return obj.map(sanitizeSchema);
            }
            if (obj && typeof obj === 'object') {
                const sanitized: any = {};
                for (const key in obj) {
                    sanitized[key] = sanitizeSchema(obj[key]);
                }
                return sanitized;
            }
            return obj;
        };
        
        const cleanSchema = sanitizeSchema(uiGenerationSchema);
        
        // Also ensure the prompt itself doesn't have problematic characters
        // (though it should be in body, not headers)
        const cleanPrompt = prompt.replace(/[\uFEFF\u200B-\u200D\u2060]/g, ''); // Remove zero-width chars
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: cleanPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: cleanSchema,
            },
        });

        // Check if response has an error
        if (!response || !response.text) {
            console.error("Invalid response structure:", response);
            throw new Error("AI returned an invalid response structure");
        }

        /* ============================================
           PRESENTATION MARKER #4: LLM PLAN RESPONSE
           ============================================
           This is where we receive the LLM's plan response.
           The response is a JSON object containing:
           - blurb: A witty summary
           - imagePrompt: Description for image generation
           - uiComponents: Array of component configurations
           Each component has a type, title, and props that define
           how to render it (cities, dataKeys, axis keys, etc.)
        */
        const jsonText = response.text.trim();
        console.log("Raw AI response:", jsonText);
        
        // Check if response looks like an error message
        if (jsonText.toLowerCase().includes('error') || jsonText.startsWith('{') === false) {
            console.warn("Response may contain an error:", jsonText);
        }
        
        let layout;
        try {
            layout = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Response text:", jsonText);
            throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

        // Basic validation
        if (!layout.blurb || !layout.imagePrompt || !Array.isArray(layout.uiComponents)) {
            console.error("Invalid layout structure:", layout);
            throw new Error("Invalid layout structure received from AI. Missing required fields: blurb, imagePrompt, or uiComponents array.");
        }

        // Validate LINE_CHART components
        layout.uiComponents.forEach((component: any, index: number) => {
            if (component.type === 'LINE_CHART') {
                if (!component.props.xAxisKey || !component.props.yAxisKey) {
                    throw new Error(`LINE_CHART component at index ${index} is missing xAxisKey or yAxisKey in props.`);
                }
                if (!component.props.cities || !Array.isArray(component.props.cities)) {
                    throw new Error(`LINE_CHART component at index ${index} is missing cities array in props.`);
                }
                const validForecastKeys = ['day', 'temp', 'humidity', 'chance_of_rain'];
                if (!validForecastKeys.includes(component.props.xAxisKey) && !validForecastKeys.includes(component.props.yAxisKey)) {
                    console.warn(`LINE_CHART component at index ${index} uses keys that may not be in forecast data. Valid keys: ${validForecastKeys.join(', ')}`);
                }
            }
        });

        return layout as GeneratedLayout;

    } catch (error) {
        console.error("Error generating UI layout:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to generate UI layout from AI: ${errorMessage}`);
    }
}

export async function generateImage(prompt: string, apiKey: string): Promise<string> {
    const cleanApiKey = apiKey.trim().replace(/[^a-zA-Z0-9\-\_\.]/g, '');
    const ai = new GoogleGenAI({ apiKey: cleanApiKey });
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