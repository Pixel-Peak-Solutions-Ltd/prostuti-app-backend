import { Request, Response, NextFunction } from 'express';

const languageMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const lang = req.query.lang || req.cookies?.lang || req.headers['x-language'] || 'en';
    req.setLocale(lang as string);
    next();
};

export default languageMiddleware;