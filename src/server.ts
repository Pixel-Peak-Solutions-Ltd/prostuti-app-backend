/* eslint-disable no-console */
import app from './app';
import mongoose from 'mongoose';
import config from './app/config';
import http from 'http';
import { initSocketService } from './app/socket/socket.service';

// async function server() {
//     try {
//         await mongoose.connect(config.database_url);
//         console.log('Database is connected');
//         app.listen(config.port || 5000, () => {
//             console.log(`Server is listening on port ${config.port}`);
//         });
//     } catch (error) {
//         console.log('########## Database is not connected ##########');
//         console.log(error);
//     }
// }

async function server() {
    try {
        await mongoose.connect(config.database_url);
        console.log('Database is connected');

        // Create HTTP server from Express app
        const httpServer = http.createServer(app);

        // Initialize socket service
        initSocketService(httpServer);

        // Listen on the HTTP server instead of the Express app
        httpServer.listen(config.port || 5000, () => {
            console.log(`Server is listening on port ${config.port}`);
        });
    } catch (error) {
        console.log('########## Database is not connected ##########');
        console.log(error);
    }
}

server();
