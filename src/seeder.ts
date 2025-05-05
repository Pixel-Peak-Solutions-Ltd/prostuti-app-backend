// src/seeder.ts
import mongoose from 'mongoose';
import config from './app/config';

// Import your models
// import { User } from './app/modules/user/user.model';

async function seedDatabase() {
    try {
        // Connect to database
        await mongoose.connect(config.database_url);
        console.log(`Connected to ${config.NODE_ENV} database for seeding`);

        // Clear existing data (only in dev and staging)
        if (!config.isProduction()) {
            // Uncomment as needed for your models
            // await User.deleteMany({});
            console.log('Cleared existing data');
        }

        // Seed different data based on environment
        if (config.isDevelopment()) {
            // Seed development data
            // await User.create({
            //   name: 'Dev User',
            //   email: 'dev@example.com',
            //   password: 'password123',
            // });
            console.log('Seeded development data');
        }
        else if (config.isStaging()) {
            // Seed staging data (more realistic test data)
            // await User.create({
            //   name: 'Staging User',
            //   email: 'staging@example.com',
            //   password: 'password123',
            // });
            console.log('Seeded staging data');
        }
        else if (config.isProduction()) {
            // Only seed essential production data
            // No test users, only essential data like settings
            console.log('Seeded essential production data');
        }

        console.log('Database seeding completed');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Disconnect
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

// Run seeder if called directly
if (require.main === module) {
    seedDatabase().then(() => {
        process.exit(0);
    });
}

export default seedDatabase;