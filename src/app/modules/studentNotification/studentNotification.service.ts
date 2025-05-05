import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Student } from '../student/student.model';
import { IStudentNotification } from './studentNotification.interface';
import { StudentNotification } from './studentNotification.modal';
import QueryBuilder from './studentNotificationQueryBuilder';
import { studentNotificationSearchableFields } from './studentNotification.constant';

const createStudentNotification = async (payload: IStudentNotification) => {
    await StudentNotification.create(payload);

    return null;
};

const getStudentNotifications = async (
    user: TJWTDecodedUser,
    query: Record<string, unknown>,
) => {
    const { userId } = user;
    const student = await Student.findOne({ user_id: userId });

    if (!student) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
    }

    const studentNotificationsQuery = new QueryBuilder(
        StudentNotification.find({ student_id: student._id }),
        query,
    )
        .search(studentNotificationSearchableFields)
        .sort();

    const studentNotifications = await studentNotificationsQuery.modelQuery;

    return studentNotifications;
};

const makeReadStudentNotification = async (
    notificationId: string,
    userId: string,
) => {
    const student = await Student.findOne({ user_id: userId });
    if (!student) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
    }

    const notification = await StudentNotification.findOneAndUpdate(
        {
            _id: notificationId,
            student_id: student._id,
        },
        { isRead: true },
        { new: true },
    );

    if (!notification) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Notification not found or you do not have permission to mark it as read',
        );
    }

    return notification;
};

// Add to exports
export const studentNotificationService = {
    createStudentNotification,
    getStudentNotifications,
    makeReadStudentNotification,
};
