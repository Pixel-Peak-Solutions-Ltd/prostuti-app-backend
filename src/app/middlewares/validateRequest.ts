import { ZodType, ZodObject, AnyZodObject } from 'zod';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';

const validateRequest = (schema: ZodObject<any>) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            // Attempt to validate the entire schema
            const result = await schema.safeParseAsync({
                body: req.body,
                params: req.params,
                query: req.query,
                cookies: req.cookies
            });

            if (!result.success) {
                throw result.error;
            }

            // Update request object with validated data
            if (result.data.body) {
                req.body = result.data.body;
            }
            if (result.data.params) {
                req.params = result.data.params;
            }
            if (result.data.query) {
                req.query = result.data.query;
            }
            if (result.data.cookies) {
                req.cookies = result.data.cookies;
            }

            next();
        },
    );
};

export default validateRequest;