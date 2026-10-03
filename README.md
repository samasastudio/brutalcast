<div align="center">
<img width="1200" height="475" alt="Brutalcast Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Brutalcast

A generative weather interface built with React, TypeScript, and the Google Gemini API.

## 1. Overview

Brutalcast converts real-time meteorological observations into dynamic, brutalist interface layouts. The application uses the Gemini 2.0 Flash model to interpret forecast data and generate structured visual components at runtime.

## 2. Technical Stack

- **Framework**: React 19 and Vite
- **Language**: TypeScript
- **AI Engine**: Google GenAI SDK (`@google/genai`)
- **Visualizations**: Recharts
- **Styling**: Brutalist design system with inline SVG assets

## 3. Prerequisites

Before you start, verify you have:
- Node.js version 18.0 or later installed.
- A valid Google Gemini API key from [Google AI Studio](https://aistudio.google.com/).

## 4. Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/samasastudio/brutalcast.git
   cd brutalcast
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Create the environment configuration file:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY="your-api-key-here"
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173` in your web browser.

## 5. Verification Commands

- **Typecheck**: `npx tsc --noEmit`
- **Production Build**: `npm run build`
- **Preview Build**: `npm run preview`
