import jwt, { SignOptions } from 'jsonwebtoken';
import { TJWTDecodedUser, TJWTPayload } from '../../interfaces/jwt/jwt.type';

const createToken = (
    jwtPayload: TJWTPayload,
    secret: string,
    expiresIn: string | number,
) => {
    return jwt.sign(jwtPayload, secret, {
        expiresIn: expiresIn as SignOptions['expiresIn'],
    });
};

const verifyToken = (token: string, secret: string) => {
    return jwt.verify(token, secret) as TJWTDecodedUser;
};

export const jwtHelpers = { createToken, verifyToken };
