import jwt from 'jsonwebtoken';
import { TJWTDecodedUser, TJWTPayload } from '../../interfaces/jwt/jwt.type';

const createToken = (
    jwtPayload: TJWTPayload,
    secret: string,
    expiresIn: string,
) => {
    return jwt.sign(jwtPayload, secret, {
        expiresIn,
    });
};

const verifyToken = (token: string, secret: string) => {
    return jwt.verify(token, secret) as TJWTDecodedUser;
};

export const jwtHelpers = { createToken, verifyToken };
