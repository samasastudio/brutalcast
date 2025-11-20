# Bug Report & Next Session Plan

## Current Status
We have successfully implemented the line chart refactor, fixed the single-city display issue, and resolved the chart over-generation bug. However, two new issues have been identified during verification.

## Identified Bugs

### 1. Duplicate X-Axis Labels on Line Chart
- **Issue**: When requesting a forecast (e.g., "3 days"), the X-axis sometimes displays the same day twice (e.g., "Thurs", "Thurs").
- **Likely Cause**: Timezone mismatch in `weatherService.ts`.
    - The service groups forecasts by **UTC Date** (`toISOString().split('T')[0]`).
    - However, it generates the display label (`dayName`) using **Local Time** (`toLocaleDateString`).
    - **Scenario**: A forecast point at 11 PM UTC (Day 1) and 1 AM UTC (Day 2) are different UTC days, so both are processed. But in the user's local time (e.g., CST), both might still be "Thursday".
- **Proposed Fix**:
    - Update `weatherService.ts` to group forecasts based on the **Local Date** of the user, not UTC.
    - Alternatively, ensure that the `dayName` generation aligns strictly with the grouping logic.

### 2. Broken Scatter Chart Tooltip
- **Issue**: Hovering over the Scatter Chart shows a black box with no information.
- **Likely Cause**: The `Tooltip` component in `WeatherScatterChart.tsx` is likely missing a proper `formatter` or `content` configuration to handle the specific data structure (x, y, z axes).
    - Recharts `ScatterChart` tooltips often need custom formatters because the default payload structure differs from line/bar charts.
- **Proposed Fix**:
    - Inspect and update `WeatherScatterChart.tsx`.
    - Add a custom `formatter` to the `Tooltip` to explicitly display the X, Y, and Z values with their units.

## Code Review Summary
- **`WeatherLineChart.tsx`**: Refactored to use `LineChart`. Logic for pivoting data seems sound, but relies on `weatherService.ts` providing unique days.
- **`geminiService.ts`**: Prompt restoration was successful. It now correctly restricts output to requested components.
- **`types.ts`**: Updated correctly to support `limitDays`.
- **`App.tsx`**: Rate limiting and error handling are in place.

## Plan for Next Session

1.  **Fix Duplicate Days**:
    - Refactor `weatherService.ts` to use local time for day grouping to prevent "double days" on the chart.
2.  **Fix Scatter Tooltip**:
    - Update `WeatherScatterChart.tsx` with a proper tooltip formatter.
3.  **Comprehensive Testing**:
    - Verify the fix for "Thurs/Thurs" duplicate.
    - Verify Scatter chart hover state.
    - Regression test: Ensure Line Chart still handles multiple cities correctly.
