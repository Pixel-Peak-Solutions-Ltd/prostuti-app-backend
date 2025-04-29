import mongoose, { Types } from 'mongoose';
import { ILesson } from './lesson.interface';
import { Lesson } from './lesson.model';
import { Course } from '../course/course.model';
import AppError from '../../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';
import { Assignment } from '../assignment/assignment.model';
import { deleteFromB2 } from '../../../utils/backBlaze';
import { RecodedClass } from '../recodedClass/recodedClass.model';
import { Resource } from '../resource/resource.model';
import { Test } from '../test/test.model';

const createLesson = async (payload: {
    lessons: Partial<ILesson[]>;
    course_id: Types.ObjectId;
}) => {
    const { lessons, course_id } = payload;

    // Validate course existence
    const courseExists = await Course.findById(course_id);
    if (!courseExists) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course does not exist');
    }

    // Check for duplicate lesson numbers within the same course
    const lessonNumbers = lessons.map((l) => l!.number);

    const duplicateWithinInput = lessonNumbers.some(
        (number, index) => lessonNumbers.indexOf(number) !== index,
    );
    if (duplicateWithinInput) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Duplicate lesson numbers within the input',
        );
    }

    // Check for existing lessons with same number in the course
    // const existingLessons = await Lesson.find({
    //     course_id,
    //     number: { $in: lessonNumbers },
    // });

    // if (existingLessons.length > 0) {
    //     const existingNumbers = existingLessons.map((l) => l.number);
    //     throw new AppError(
    //         StatusCodes.BAD_REQUEST,
    //         `Lesson number(s) already exist for this course: ${existingNumbers.join(', ')}`,
    //     );
    // }

    // Create multiple lesson documents in a single operation
    const createdLessons = await Lesson.insertMany(
        lessons.map((l) => ({
            number: l!.number,
            name: l!.name,
            course_id: course_id,
        })),
    );

    return createdLessons;
};

const getAllLessonsByCourseId = async (courseId: string) => {
    // Check if the course exist
    const isCourseExist = await Course.findById(courseId);
    if (!isCourseExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Course does not exist with this ID',
        );
    }

    const lessons = await Lesson.find({ course_id: courseId });

    // Helper to extract numeric part from a string like "Lesson 03", "lesson-1", "lesson_2"
    const extractNumber = (str: string): number => {
        const match = str.match(/\d+/); // matches first sequence of digits
        return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER; // fallback large number if no match
    };

    // Sort lessons by extracting the number from the `number` field
    const sortedLessons = lessons.sort((a, b) => {
        const numA = extractNumber(a.number);
        const numB = extractNumber(b.number);
        return numA - numB;
    });

    return sortedLessons;
};

const updateLesson = async (lessonId: string, payload: Partial<ILesson>) => {
    // Check if the lesson exist
    const isLessonExist = await Lesson.findById(lessonId);
    if (!isLessonExist) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Lesson not found');
    }

    // Filter out the fields to update
    const updatedPayload: Partial<ILesson> = {
        ...(payload.number && {
            number: payload.number,
        }),
        ...(payload.name && { name: payload.name }),
    };

    // Update the record in the database
    const updatedLEsson = await Lesson.findByIdAndUpdate(
        lessonId,
        updatedPayload,
        { new: true, runValidators: true },
    );

    return updatedLEsson;
};

const deleteLessonByID = async (lessonId: string) => {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Lesson not found');
    }

    // Pre-fetch related documents (no transaction needed here)
    const [assignments, recordedClasses, resources] = await Promise.all([
        Assignment.find({ lesson_id: lessonId }).lean(),
        RecodedClass.find({ lesson_id: lessonId }).lean(),
        Resource.find({ lesson_id: lessonId }).lean(),
    ]);

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Each operation must await serially with session binding
        await Assignment.deleteMany({ lesson_id: lessonId }).session(session);
        await RecodedClass.deleteMany({ lesson_id: lessonId }).session(session);
        await Resource.deleteMany({ lesson_id: lessonId }).session(session);
        await Test.deleteMany({ lesson_id: lessonId }).session(session);
        await Lesson.findByIdAndDelete(lessonId).session(session);

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.error('Mongo transaction error:', error);
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to delete from database',
        );
    } finally {
        session.endSession();
    }

    // B2 deletions (do not affect API response)
    const b2Tasks: Promise<void>[] = [];

    assignments.forEach((assignment) => {
        assignment.uploadFileResources?.forEach((res) => {
            if (res?.fileId && res?.modifiedName) {
                b2Tasks.push(
                    deleteFromB2(
                        res.fileId,
                        res.modifiedName,
                        'courseAssignments',
                    ),
                );
            }
        });
    });

    recordedClasses.forEach((rc) => {
        if (rc?.classVideoURL?.fileId && rc?.classVideoURL?.modifiedName) {
            b2Tasks.push(
                deleteFromB2(
                    rc.classVideoURL.fileId,
                    rc.classVideoURL.modifiedName,
                    'videos',
                ),
            );
        }
    });

    resources.forEach((res) => {
        res.uploadFileResources?.forEach((file) => {
            if (file?.fileId && file?.modifiedName) {
                b2Tasks.push(
                    deleteFromB2(
                        file.fileId,
                        file.modifiedName,
                        'courseResources',
                    ),
                );
            }
        });
    });

    // Fire and forget
    Promise.allSettled(b2Tasks).then((results) => {
        results.forEach((result) => {
            if (result.status === 'rejected') {
                console.error('B2 deletion failed:', result.reason);
            }
        });
    });

    return null;
};

export const lessonService = {
    createLesson,
    getAllLessonsByCourseId,
    updateLesson,
    deleteLessonByID,
};
