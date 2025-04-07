import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import healthCheck from './app/middlewares/healthCheck';
import notFound from './app/middlewares/notFound';
import globalRoute from './app/routes';
import languageMiddleware from './app/middlewares/language';
import i18n from './app/i18n';

const app: Application = express();

// cors options
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:63342',
        'https://prostuti-app-teacher-admin-dashb-production.up.railway.app'
    ], // Your frontend's URL
    credentials: true, // Allow cookies and credentials to be sent
    optionSuccessStatus: 200,
};

// Trust proxy
app.set('trust proxy', 1);

// Parser
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// App route
app.use('/api/v1', globalRoute);

// Initialize i18n
app.use(i18n.init);

// Use language setting middleware
app.use(languageMiddleware);

// Server Health Check Route
app.get('/', healthCheck);
app.get('/health', healthCheck);

// Global Error Handler
app.use(globalErrorHandler);

// Not found route
app.use(notFound);

export default app;
