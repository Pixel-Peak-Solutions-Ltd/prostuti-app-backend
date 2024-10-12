import { TJWTDecodedUser } from './jwt/jwt.type';

declare global {
    namespace Express {
        interface Request {
            user: TJWTDecodedUser;
        }
    }
}
