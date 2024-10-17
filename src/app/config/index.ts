import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    NODE_ENV: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    bcrypt_salt: process.env.BCRYPT_SALT,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_expired_in: process.env.JWT_ACCESS_EXPIRES_IN,
    alpha_sms_api_key: process.env.ALPHA_SMS_API_KEY,
    alpha_sms_endpoint: process.env.ALPHA_SMS_ENDPOINT,
    otp_Expiration_Time: process.env.OTP_EXPIRATION_TIME,
};
