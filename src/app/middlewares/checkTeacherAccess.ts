import { NextFunction, Request, Response } from 'express';
import AppError from '../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';
import { USER_ROLE } from '../modules/user/user.constant';
import { Teacher } from '../modules/teacher/teacher.model';

const checkTeacherAccess = (...requiredWorks: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
            }

            // Admins bypass this check
            if (user.role === USER_ROLE.admin) {
                return next();
            }

            // Only proceed if the user is a teacher
            if (user.role === USER_ROLE.teacher) {
                const teacher = await Teacher.findOne({ user_id: user.userId });

                if (!teacher) {
                    throw new AppError(StatusCodes.NOT_FOUND, 'Teacher profile not found');
                }

                const hasAccess = requiredWorks.every((work) => 
                    teacher.assignedWorks.includes(work)
                );

                if (!hasAccess) {
                    throw new AppError(
                        StatusCodes.FORBIDDEN,
                        `You do not have permission to access ${requiredWorks.join(', ')} related features.`
                    );
                }

                return next();
            }

            // If user is neither admin nor teacher (and reached this middleware), forbid access
            // Or if existing auth() allowed student, but this middleware was added, block it.
            // But usually this middleware follows auth(teacher, admin).
            throw new AppError(StatusCodes.FORBIDDEN, 'Access Forbidden');

        } catch (error) {
            next(error);
        }
    };
};

export default checkTeacherAccess;
