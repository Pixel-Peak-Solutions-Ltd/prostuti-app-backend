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
    // 1. Find the lesson to delete and verify it exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Lesson not found');
    }
    try {
        // 2. Start a transaction for MongoDB operations
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 3. Delete all MongoDB documents in parallel
            await Promise.all([
                Assignment.deleteMany({ lesson_id: lessonId }).session(session),
                RecodedClass.deleteMany({ lesson_id: lessonId }).session(
                    session,
                ),
                Resource.deleteMany({ lesson_id: lessonId }).session(session),
                Test.deleteMany({ lesson_id: lessonId }).session(session),
                Lesson.findByIdAndDelete(lessonId).session(session),
            ]);

            // 4. Commit the MongoDB transaction
            await session.commitTransaction();
            session.endSession();

            // 5. Fetch resource info for B2 deletion (can do this after MongoDB transaction)
            const [assignments, recordedClasses, resources] = await Promise.all(
                [
                    Assignment.find({ lesson_id: lessonId }).lean(),
                    RecodedClass.find({ lesson_id: lessonId }).lean(),
                    Resource.find({ lesson_id: lessonId }).lean(),
                ],
            );

            // 6. Collect all B2 deletion tasks into a single array
            const b2DeletionTasks: Promise<void>[] = [];

            // Process assignments
            assignments.forEach((assignment) => {
                if (assignment.uploadFileResources?.length > 0) {
                    assignment.uploadFileResources.forEach((resource) => {
                        b2DeletionTasks.push(
                            deleteFromB2(
                                resource.fileId,
                                resource.modifiedName,
                                'courseAssignments',
                            ),
                        );
                    });
                }
            });

            // Process recorded classes
            recordedClasses.forEach((recordedClass) => {
                if (recordedClass.classVideoURL) {
                    b2DeletionTasks.push(
                        deleteFromB2(
                            recordedClass.classVideoURL.fileId,
                            recordedClass.classVideoURL.modifiedName,
                            'videos',
                        ),
                    );
                }
            });

            // Process resources
            resources.forEach((resource) => {
                if (resource.uploadFileResources?.length > 0) {
                    resource.uploadFileResources.forEach((fileResource) => {
                        b2DeletionTasks.push(
                            deleteFromB2(
                                fileResource.fileId,
                                fileResource.modifiedName,
                                'courseResources',
                            ),
                        );
                    });
                }
            });

            // 7. Execute B2 deletions in batches to avoid overwhelming the B2 API
            // Process 10 files at a time
            const BATCH_SIZE = 10;
            for (let i = 0; i < b2DeletionTasks.length; i += BATCH_SIZE) {
                const batch = b2DeletionTasks.slice(i, i + BATCH_SIZE);
                await Promise.all(batch);
            }

            return null;
        } catch (error) {
            // If any error occurs in MongoDB operations, abort the transaction
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        // Log the error for debugging
        console.error('Error in deleteLessonByID:', error);

        // Re-throw the error for the controller to handle
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to delete lesson and its resources',
        );
    }
};

export const lessonService = {
    createLesson,
    getAllLessonsByCourseId,
    updateLesson,
    deleteLessonByID,
};
