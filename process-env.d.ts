declare namespace NodeJS {
    export type ProcessEnv = {
        FRONTEND_URL: any;
        BACKEND_URL: any;
        NODE_ENV: string;
        PORT: number;
        DATABASE_URL: string;
        JWT_ACCESS_TOKEN_SECRET: string;
        JWT_REFRESH_TOKEN_SECRET: string;
        JWT_ACCESS_TOKEN_EXPIRES_IN: string;
        JWT_REFRESH_TOKEN_EXPIRES_IN: string;
        JWT_STUDENT_ACCESS_TOKEN_EXPIRES_IN: string;
        JWT_STUDENT_REFRESH_TOKEN_EXPIRES_IN: string;
        BCRYPT_SALT: number;
        ALPHA_SMS_API_KEY: string;
        ALPHA_SMS_ENDPOINT: string;
        OTP_EXPIRATION_TIME: number;
        VERIFIED_PHONE_DOC_EXPIRATION: number;
        REFRESH_TOKEN_DEFAULT_COOKIE_AGE: number;
        BACKBLAZE_APPLICATION_KEY: string;
        BACKBLAZE_KEY_ID: string;
        BACKBLAZE_ALL_USERS_BUCKET_ID: string;
        BACKBLAZE_ALL_USERS_BUCKET_NAME: string;
        SSLCOMMERZ_STORE_ID: string;
        SSLCOMMERZ_STORE_PASSWORD: string;
        SSLCOMMERZ_IS_LIVE: boolean;
    };
}
