import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { notificationService } from '../notification/notification.service';
import { Course } from '../courseManagement/course/course.model';
import { Assignment } from '../courseManagement/assignment/assignment.model';
import { RecodedClass } from '../courseManagement/recodedClass/recodedClass.model';
import { Resource } from '../courseManagement/resource/resource.model';
import { Test } from '../courseManagement/test/test.model';
import { Teacher } from '../teacher/teacher.model';
import { User } from '../user/user.model';
import { IPaginationOptions } from '../../interfaces/common';

const validResourceTypes = ['Course', 'Assignment', 'RecodedClass', 'Resource', 'Test'];

const getModelForResource = (resourceType: string) => {
    switch (resourceType) {
        case 'Course':
            return Course;
        case 'Assignment':
            return Assignment;
        case 'RecodedClass':
            return RecodedClass;
        case 'Resource':
            return Resource;
        case 'Test':
            return Test;
        default:
            throw new Error(`Invalid resource type: ${resourceType}`);
    }
};

// Request an edit to a resource
const requestEdit = async (
    userInfo: TJWTDecodedUser,
    payload: {
        resourceType: string;
        resourceId: string;
        title: string;
        message: string;
    }
) => {
    // Validate resource type
    if (!validResourceTypes.includes(payload.resourceType)) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Invalid resource type. Must be one of: ${validResourceTypes.join(', ')}`
        );
    }

    // Find the resource
    let resource;
    let teacherId;

    // Use a type-safe approach based on resource type
    if (payload.resourceType === 'Course') {
        resource = await Course.findById(payload.resourceId).exec();
        if (!resource) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
        }
        teacherId = resource.teacher_id;
    } else if (payload.resourceType === 'Assignment') {
        resource = await Assignment.findById(payload.resourceId).exec();
        if (!resource) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Assignment not found');
        }
        const course = await Course.findById(resource.course_id).exec();
        if (!course) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                'Course associated with this assignment not found'
            );
        }
        teacherId = course.teacher_id;
    } else if (payload.resourceType === 'RecodedClass') {
        resource = await RecodedClass.findById(payload.resourceId).exec();
        if (!resource) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Recorded Class not found');
        }
        const course = await Course.findById(resource.course_id).exec();
        if (!course) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                'Course associated with this recorded class not found'
            );
        }
        teacherId = course.teacher_id;
    } else if (payload.resourceType === 'Resource') {
        resource = await Resource.findById(payload.resourceId).exec();
        if (!resource) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Resource not found');
        }
        const course = await Course.findById(resource.course_id).exec();
        if (!course) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                'Course associated with this resource not found'
            );
        }
        teacherId = course.teacher_id;
    } else if (payload.resourceType === 'Test') {
        resource = await Test.findById(payload.resourceId).exec();
        if (!resource) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Test not found');
        }
        const course = await Course.findById(resource.course_id).exec();
        if (!course) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                'Course associated with this test not found'
            );
        }
        teacherId = course.teacher_id;
    } else {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Unsupported resource type: ${payload.resourceType}`
        );
    }

    // Find the teacher's user ID
    const teacher = await Teacher.findOne({ user_id: teacherId });
    if (!teacher) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Teacher associated with this resource not found'
        );
    }

    // Create a notification for the teacher
    const notification = await notificationService.createNotification(
        userInfo,
        {
            recipientId: teacher.user_id.toString(),
            type: 'EditRequest',
            title: payload.title,
            message: payload.message,
            resourceType: payload.resourceType,
            resourceId: payload.resourceId,
            metaData: {
                requestedBy: userInfo.userId,
                requestedAt: new Date().toISOString(),
            },
        }
    );

    return notification;
};

const getMyEditRequests = async (
    userInfo: TJWTDecodedUser,
    filters: Record<string, any>,
    paginationOptions: IPaginationOptions
) => {
    // Create a new filters object to avoid modifying the original
    const editRequestFilters: Record<string, any> = { ...filters };

    // Add filter for sender and type
    editRequestFilters.sender = userInfo.userId;
    editRequestFilters.type = 'EditRequest';

    // Use notification service to get the edit requests
    return await notificationService.getMyNotifications(
        userInfo,
        editRequestFilters,
        paginationOptions
    );
};

export const editRequestService = {
    requestEdit,
    getMyEditRequests,
};