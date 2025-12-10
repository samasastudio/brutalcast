export const getGenerationInstructions = (prompt: string): string => {
    if (!prompt.trim()) {
        return `
      The user has not specified a layout. Please generate a diverse and interesting layout automatically.
      Your response should include 3 to 5 different UI components to compare the weather data in interesting ways.
      - For charts, choose data keys that make for an interesting comparison.
      - For tables, select a few key columns.
      - For cards, select a few cities to highlight. Ensure the 'cities' prop is an array of city name strings.
    `;
    }
    
    return `
      The user has provided a specific request for the UI layout.
      IMPORTANT: You MUST generate ONLY the components described in the user's request. Do NOT add any extra components.
      Fulfill their request as accurately as possible.
      
      User's request: "${prompt}"
      
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
};
