import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import i18n from 'i18n';
import config from './app/config';
import { addDevHeaders, addEnvironmentBanner } from './app/middlewares/enviroment.middleware';
import globalRoute from './app/routes';
import languageMiddleware from './app/middlewares/language';
import healthCheck from './app/middlewares/healthCheck';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound'; // Adjust import path as needed





const app: Application = express();

// Trust proxy
app.set('trust proxy', 1);

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

// Parser
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize i18n
app.use(i18n.init);

// Use language setting middleware
app.use(languageMiddleware);

// App route - CRITICAL: This mounts all your API routes
app.use('/api/v1', globalRoute);

app.get('/', healthCheck);
app.get('/health', healthCheck);

app.get('/health', (req, res) => {
    res.status(200).json({
        message: 'Server is healthy',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Global Error Handler
app.use(globalErrorHandler);

// Not found route
app.use(notFound);

export default app;