/* eslint-disable no-console */
import app from './app';
import mongoose from 'mongoose';
import config from './app/config';
import http from 'http';
import { SocketHandler } from './app/modules/chat/socketHandler';
import "./app/Scheduler/index"

// Create HTTP server
const server = http.createServer(app);

// Initialize socket handler
let socketHandler: SocketHandler;

async function startServer() {
    try {
        // Log environment and connection details (not in production)
        if (!config.isProduction()) {
            console.log(`Environment: ${config.NODE_ENV}`);
            console.log(`Connecting to database: ${config.database_url.split('@')[1].split('/')[0]}`);
        }

        // Connect to MongoDB with environment-specific options
        const mongooseOptions: mongoose.ConnectOptions = {
            // Add environment-specific connection options
            serverSelectionTimeoutMS: config.isProduction() ? 30000 : 5000,
        };

        await mongoose.connect(config.database_url);
        console.log(`Database is connected (${config.NODE_ENV} environment)`);

        // Initialize Socket.IO after MongoDB connection is established
        socketHandler = new SocketHandler(server);

        server.listen(config.port || 5000, () => {
            console.log(`Server is listening on port ${config.port} (${config.NODE_ENV} environment)`);
            console.log('Socket.IO server is initialized');
        });
    } catch (error) {
        console.log(`########## Database connection failed (${config.NODE_ENV} environment) ##########`);
        console.log(error);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false);
    });
});

startServer();

// Export for testing purposes
export { server, socketHandler };