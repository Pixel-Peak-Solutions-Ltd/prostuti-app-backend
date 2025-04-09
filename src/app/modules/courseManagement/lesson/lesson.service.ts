import { Types } from 'mongoose';
import { ILesson } from './lesson.interface';
import { Lesson } from './lesson.model';
import { Course } from '../course/course.model';
import AppError from '../../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';

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
    return lessons;
};

const getAllLessons = async () => {
    return 'getAllLessons';
};

const getLessonByID = async () => {
    return 'getRecodedClassID';
};

const updateLesson = async () => {
    return 'updateLesson';
};

const deleteLessonByID = async () => {
    return 'deleteLessonByID';
};

export const lessonService = {
    createLesson,
    getAllLessons,
    getAllLessonsByCourseId,
    getLessonByID,
    updateLesson,
    deleteLessonByID,
};
