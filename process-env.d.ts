declare namespace NodeJS {
    export type ProcessEnv = {
        NODE_ENV: string;
        PORT: number;
        DATABASE_URL: string;
        JWT_ACCESS_SECRET: string;
        JWT_ACCESS_EXPIRES_IN: string;
        BCRYPT_SALT: number;
        TWILIO_ACCOUNT_SID: string;
        TWILIO_AUTH_TOKEN: string;
        TWILIO_SERVICE_SID: string;
    };
}
