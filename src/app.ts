// Add to your app.ts file

import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './app/config';
import { addDevHeaders, addEnvironmentBanner } from './app/middlewares/enviroment.middleware';

const app: Application = express();

// Apply environment-specific middleware
if (!config.isProduction()) {
    app.use(addDevHeaders);

    // Only add environment banner in development and staging
    if (config.isDevelopment() || config.isStaging()) {
        app.use(addEnvironmentBanner);
    }
}

// Configure CORS based on environment
const corsOptions = {
    origin: config.isProduction()
        ? config.frontend_url // Strict in production
        : [config.frontend_url, 'http://localhost:3000', 'http://localhost:3001'], // More permissive in dev/staging
    credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add environment info to health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        message: 'Server is healthy',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// Rest of your app configuration...

export default app;