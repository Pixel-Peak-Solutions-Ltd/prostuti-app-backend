import express, { Application } from 'express';
import cors from 'cors';
import notFound from './app/middlewares/notFound';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import globalRoute from './app/routes';
import healthCheck from './app/middlewares/healthCheck';
import cookieParser from 'cookie-parser';

const app: Application = express();


// cors options
const corsOptions = {
    origin: 'http://localhost:5173', // Your frontend's URL
    credentials: true, // Allow cookies and credentials to be sent
};

// Trust proxy
app.set('trust proxy', 1);

// Parser
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// App route
app.use('/api/v1', globalRoute);

// Server Health Check Route
app.get('/', healthCheck);
app.get('/health', healthCheck);

// Global Error Handler
app.use(globalErrorHandler);

// Not found route
app.use(notFound);

export default app;
