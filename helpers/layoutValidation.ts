export const parseLayout = (text: string): any => {
    try {
        return JSON.parse(text);
    } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", text);
        throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
};

export const validateLineChartComponent = (component: any, index: number): void => {
    if (component.type !== 'LINE_CHART') return;
    
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
};
