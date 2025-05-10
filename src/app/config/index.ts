import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    NODE_ENV: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    backend_url: process.env.BACKEND_URL,
    frontend_url: process.env.FRONTEND_URL,
    bcrypt_salt: process.env.BCRYPT_SALT,
    jwt_access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    jwt_refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    jwt_access_token_expired_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    jwt_refresh_token_expired_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    jwt_student_access_token_expires_in:
        process.env.JWT_STUDENT_ACCESS_TOKEN_EXPIRES_IN,
    jwt_student_refresh_token_expires_in:
        process.env.JWT_STUDENT_REFRESH_TOKEN_EXPIRES_IN,
    alpha_sms_api_key: process.env.ALPHA_SMS_API_KEY,
    alpha_sms_endpoint: process.env.ALPHA_SMS_ENDPOINT,
    otp_Expiration_Time: process.env.OTP_EXPIRATION_TIME,
    verified_phone_doc_expiration: process.env.VERIFIED_PHONE_DOC_EXPIRATION,
    refresh_token_default_cookie_age:
        process.env.REFRESH_TOKEN_DEFAULT_COOKIE_AGE,
    backblaze_application_key: process.env.BACKBLAZE_APPLICATION_KEY,
    backblaze_key_id: process.env.BACKBLAZE_KEY_ID,
    backblaze_all_users_bucket_id: process.env.BACKBLAZE_ALL_USERS_BUCKET_ID,
    backblaze_all_users_bucket_name:
        process.env.BACKBLAZE_ALL_USERS_BUCKET_NAME,
    sslcommerz_store_id: process.env.SSLCOMMERZ_STORE_ID,
    sslcommerz_store_password: process.env.SSLCOMMERZ_STORE_PASSWORD,
    sslcommerz_isLive: process.env.SSLCOMMERZ_IS_LIVE,
};
