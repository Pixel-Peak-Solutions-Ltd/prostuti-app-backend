// src/app/middlewares/environment.middleware.ts
import { Request, Response, NextFunction } from 'express';
import config from '../config';

// Middleware to prevent access to certain routes in production
export const preventInProduction = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (config.isProduction()) {
        return res.status(403).json({
            success: false,
            message: 'This endpoint is not available in production',
        });
    }
    next();
};

// Middleware to add development debugging headers
export const addDevHeaders = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (config.isDevelopment()) {
        res.setHeader('X-Environment', 'development');
        // Add more dev-specific headers if needed
    }
    next();
};

// Middleware to add warning banners for non-production environments
export const addEnvironmentBanner = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!config.isProduction()) {
        const oldSend = res.send;
        res.send = function (data) {
            // Only process HTML responses
            if (typeof data === 'string' && data.includes('<html')) {
                // Add environment banner for HTML responses
                const bannerStyle = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background-color: ${config.isStaging() ? 'orange' : 'red'};
                    color: white;
                    text-align: center;
                    padding: 5px;
                    z-index: 9999;
                `;
                const banner = `<div style="${bannerStyle}">
                    ${config.NODE_ENV.toUpperCase()} ENVIRONMENT
                </div>`;

                // Insert banner after <body> tag
                data = data.replace('<body>', '<body>' + banner);
            }
            return oldSend.call(this, data);
        };
    }
    next();
};