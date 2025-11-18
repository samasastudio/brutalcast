import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Initialize with standard env vars
    const envConfig = {
        GEMINI_API_KEY: env.GEMINI_API_KEY || '',
        OPENWEATHER_API_KEY: env.OPENWEATHER_API_KEY || ''
    };

    // Attempt to read from api_keys.json as a fallback for environments that block .env files
    try {
        const keyPath = path.resolve(__dirname, 'api_keys.json');
        if (fs.existsSync(keyPath)) {
            const keyContent = fs.readFileSync(keyPath, 'utf-8');
            const parsedKeys = JSON.parse(keyContent);
            if (parsedKeys.GEMINI_API_KEY) envConfig.GEMINI_API_KEY = parsedKeys.GEMINI_API_KEY;
            if (parsedKeys.OPENWEATHER_API_KEY) envConfig.OPENWEATHER_API_KEY = parsedKeys.OPENWEATHER_API_KEY;
        }
    } catch (err) {
        // Ignore errors if file doesn't exist or is invalid
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(envConfig.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(envConfig.GEMINI_API_KEY),
        'process.env.OPENWEATHER_API_KEY': JSON.stringify(envConfig.OPENWEATHER_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});