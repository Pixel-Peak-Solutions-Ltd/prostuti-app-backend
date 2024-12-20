import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Course } from '../courseManagement/course/course.model';
import { Student } from '../student/student.model';
import { EnrolledCourse } from './enrolledCourse.model';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import SSLCommerzPayment from 'sslcommerz-lts';
import { Payment } from '../payment/payment.model';

const store_id = 'bakin62b84b547d1c3';
const store_passwd = 'bakin62b84b547d1c3@ssl';
const is_live = false;

const createFreeEnrolledCourse = async (
    userInfo: TJWTDecodedUser,
    payload: { course_id: string[] },
): Promise<any> => {
    const { course_id } = payload;

    // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }

    // Check if all course IDs are valid
    const courses = await Course.find({ _id: { $in: course_id } });

    // If courses not found
    if (courses.length !== course_id.length) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'One or more courses are not found.',
        );
    }

    // Check if all courses are free
    const nonFreeCourse = courses.find((course) => course.priceType !== 'Free');
    if (nonFreeCourse) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'One or more courses are not free.',
        );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Enroll courses
        for (const course of courses) {
            // Check if already enrolled in this course
            const existingEnrollment = await EnrolledCourse.findOne({
                student_id: studentDetails._id,
                course_id: course._id,
            });

            if (existingEnrollment) {
                throw new AppError(
                    StatusCodes.CONFLICT,
                    `Already enrolled in the course: ${course.name}`,
                );
            }

            // Create new enrollment
            const newEnrolledCourse = await EnrolledCourse.create(
                [
                    {
                        student_id: studentDetails._id,
                        course_id: course._id,
                        enrollmentType: 'Free',
                    },
                ],
                { session },
            );

            if (!newEnrolledCourse || newEnrolledCourse.length === 0) {
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Failed to enroll in the course.',
                );
            }

            // Update student with the new enrolled course
            const updatedStudent = await Student.findByIdAndUpdate(
                studentDetails._id,
                {
                    $push: { enrolledCourses: newEnrolledCourse[0]._id },
                },
                { session, new: true },
            );

            if (!updatedStudent) {
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Failed to update student enrollment.',
                );
            }
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

const createPaidEnrolledCourse = async (
    userInfo: TJWTDecodedUser,
    payload: { course_id: string[]; totalPrice: number },
): Promise<any> => {
    const { course_id, totalPrice } = payload;

    //  // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }

    //     // Get the courses
    const courses = await Course.find({ _id: { $in: course_id } });

    // //check if all course id are valid
    if (courses.length !== course_id.length) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'One or more courses are not found.',
        );
    }

    //  // Ensure all courses are paid
    const nonPaidCourse = courses.find((course) => course.priceType !== 'Paid');
    if (nonPaidCourse) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'One or more courses are not paid.',
        );
    }

    //    // Calculate the total price from the selected courses
    const calculatedTotalPrice = courses.reduce(
        (sum, course) => sum + course.price,
        0,
    );

    console.log(calculatedTotalPrice);

    // // Validate if the total price matches the sum of course prices
    if (calculatedTotalPrice !== totalPrice) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Total price does not match the sum of course prices.',
        );
    }
    for (const course of courses) {
        // Check if already enrolled in this course
        const existingEnrollment = await EnrolledCourse.findOne({
            student_id: studentDetails._id,
            course_id: course._id,
        });

        if (existingEnrollment) {
            throw new AppError(
                StatusCodes.CONFLICT,
                `Already enrolled in the course: ${course.name}`,
            );
        }
    }

    const transactionId = uuidv4();

    const data = {
        total_amount: totalPrice,
        currency: 'BDT',
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: 'http://localhost:5000/api/v1/enroll-course/paid/success',
        fail_url: 'http://localhost:5000/fail',
        cancel_url: 'http://localhost:5000/cancel',
        ipn_url: 'http://localhost:5000/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data); // Await the response
    if (!apiResponse || !apiResponse.GatewayPageURL) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Failed to initialize payment gateway',
        );
    }
    const gatewayPageURL = apiResponse.GatewayPageURL;
    const newPayment = new Payment({
        student_id: studentDetails._id,
        paymentType: 'Paid',
        amount: totalPrice,
        transactionId: transactionId,
    });
    await newPayment.save();
    return gatewayPageURL;
};

export const EnrolledCourseService = {
    createFreeEnrolledCourse,
    createPaidEnrolledCourse,
};
