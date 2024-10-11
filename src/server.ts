/* eslint-disable no-console */
import app from './app';
import mongoose from 'mongoose';
import config from './app/config';

async function server() {
    try {
        await mongoose.connect(config.database_url);
        console.log('Database is connected');
        app.listen(config.port, () => {
            console.log(`Server is listening on port ${config.port}`);
        });
    } catch (error) {
        console.log('########## Database is not connected ##########');
        console.log(error);
    }
}

server();
