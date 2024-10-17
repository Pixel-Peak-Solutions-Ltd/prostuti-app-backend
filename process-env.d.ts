declare namespace NodeJS {
    export type ProcessEnv = {
        NODE_ENV: string;
        PORT: number;
        DATABASE_URL: string;
        JWT_ACCESS_SECRET: string;
        JWT_ACCESS_EXPIRES_IN: string;
        BCRYPT_SALT: number;
        ALPHA_SMS_API_KEY: string;
        ALPHA_SMS_ENDPOINT: string;
        OTP_EXPIRATION_TIME: number;
    };
}
