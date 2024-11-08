import { StatusCodes } from 'http-status-codes';
import AppError from '../../../classes/errorClasses/AppError';
import { Course } from '../course/course.model';
import { INotice } from './notice.interface';
import { Notice } from './notice.model';

// Create Notice
const createNotice = async (payload: INotice) => {
    // Check if the course exists
    const courseExists = await Course.findById(payload.course_id);

    if (!courseExists) {
        throw new Error('Course does not exist');
    }

    // Create the notice
    const newNotice = await Notice.create(payload);

    return newNotice;
};

// Get All Notices
const getAllNotices = async () => {
    // Get all courses
    const notices = await Notice.find({});

    return notices;
};

// Get Notice By ID
const getNoticeByID = async (noticeId: string) => {
    const notice = await Notice.findById(noticeId);

    if (!notice) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Notice not found');
    }

    return notice;
};

// Update Notice
const updateNotice = async (noticeId: string, payload: INotice) => {
    // Check if there are fields to update
    if (Object.keys(payload).length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'No valid fields provided for update',
        );
    }

    // Create the updated payload
    const updatedPayload: Partial<INotice> = {
        ...(payload.course_id && { course_id: payload.course_id }),
        ...(payload.notice && { notice: payload.notice }),
    };

    // Check if the course exists
    if (updatedPayload.course_id) {
        const existingCourse = await Course.findById(updatedPayload.course_id);
        if (!existingCourse) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
        }
    }

    // Update the course
    const result = await Notice.findByIdAndUpdate(noticeId, updatedPayload, {
        new: true,
        runValidators: true,
    });

    return result;
};

// Delete Notice By ID
const deleteNoticeByID = async (noticeId: string) => {
    // Check if the notice exists
    const existingNotice = await Notice.findById(noticeId);
    if (!existingNotice) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Notice not found');
    }

    // Delete the notice from the database
    await Notice.findByIdAndDelete(noticeId);

    return null;
};

export const noticeService = {
    createNotice,
    getAllNotices,
    getNoticeByID,
    updateNotice,
    deleteNoticeByID,
};
