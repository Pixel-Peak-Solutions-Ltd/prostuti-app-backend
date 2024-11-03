import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import AppError from '../classes/errorClasses/AppError';
import config from '../config';
import { jwtHelpers } from '../helpers/jwtHelpers/jwtHelpers';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';

const auth = (...requiredRoles: TUserRole[]) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const authHeader = req.headers.authorization;

            // Check if the authorization header exists
            if (!authHeader) {
                throw new AppError(
                    StatusCodes.UNAUTHORIZED,
                    'You are not authorized',
                );
            }

            // Split the auth header and verify Bearer token format
            const [bearer, token] = authHeader.split(' ');

            // Check if the token follows Bearer format
            if (bearer !== 'Bearer' || !token) {
                throw new AppError(
                    StatusCodes.UNAUTHORIZED,
                    'Invalid token format. Token must start with "Bearer "',
                );
            }

            // Check if the token send from client
            if (!token) {
                throw new AppError(
                    StatusCodes.UNAUTHORIZED,
                    'You are not authorize',
                );
            }

            // Check if the token is verified
            const decoded = jwtHelpers.verifyToken(
                token,
                config.jwt_access_token_secret,
            );

            const { userId, role } = decoded;

            // #####################################
            const user = await User.findById(userId);

            // Check if the user exist in database
            if (!user) {
                throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
            }

            // Check if the user is already deleted
            if (user.isDeleted) {
                throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted');
            }

            // Check if the user is blocked
            if (user.status === 'blocked') {
                throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked');
            }

            // Check if the password changed recently and token is older then token is invalid
            // if (
            //     user.passwordChangedAt &&
            //     User.isJWTIssuedBeforePasswordChanged(
            //         user.passwordChangedAt,
            //         iat as number,
            //     )
            // ) {
            //     throw new AppError(
            //         StatusCodes.UNAUTHORIZED,
            //         'You are not authorize. Please login again',
            //     );
            // }

            // Check if correct role base user accessing correct role base resources
            if (requiredRoles.length && !requiredRoles.includes(role)) {
                throw new AppError(
                    StatusCodes.UNAUTHORIZED,
                    'You are not authorized to perform this action',
                );
            }

            // Set user object to request body
            req.user = decoded;

            next();
        },
    );
};

export default auth;
