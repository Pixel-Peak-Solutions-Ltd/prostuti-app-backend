import { StatusCodes } from 'http-status-codes';
import mongoose, { SortOrder } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Course } from '../courseManagement/course/course.model';
import { Student } from '../student/student.model';
import { EnrolledCourse } from './enrolledCourse.model';
// @ts-ignore
import SSLCommerzPayment from 'sslcommerz-lts';
import config from '../../config';
import { Payment } from '../payment/payment.model';
import { get } from 'mongoose';
import { EnrolledCourseSearchableFields } from './enrolledCourse.constant';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IEnrolledCourseFilters } from './enrolledCourse.interface';
import { IPaginationOptions } from '../../interfaces/common';

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

const createSubscriptionEnrolledCourse = async (
    userInfo: TJWTDecodedUser,
    payload: { course_id: string[] },
): Promise<any> => {
    const { course_id } = payload;

    // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }
    if (!studentDetails.subscriptionEndDate || studentDetails.subscriptionEndDate < new Date()) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Active subscription plan to add subscribed course',
        );
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

    // Check if all courses are subscription based
    const nonSubscriptionCourse = courses.find((course) => course.priceType !== 'Subscription');
    if (nonSubscriptionCourse) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'One or more courses are not subscription based.',
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
                        enrollmentType: 'Subscription',
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
): Promise<string> => {
    const { course_id, totalPrice } = payload;

    // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }

    // Get the courses
    const courses = await Course.find({ _id: { $in: course_id } });

    // Validate courses
    if (courses.length !== course_id.length) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'One or more courses are not found.',
        );
    }

    // Ensure all courses are paid
    const nonPaidCourse = courses.find((course) => course.priceType !== 'Paid');
    if (nonPaidCourse) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'One or more courses are not paid.',
        );
    }

    // Calculate the total price from the selected courses
    const calculatedTotalPrice = courses.reduce(
        (sum, course) => sum + course.price,
        0,
    );

    // Validate if the total price matches
    if (calculatedTotalPrice !== totalPrice) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Total price does not match the sum of course prices.',
        );
    }

    // Ensure student is not already enrolled in any of the courses
    const existingEnrollments = await EnrolledCourse.find({
        student_id: studentDetails._id,
        course_id: { $in: course_id },
    });

    if (existingEnrollments.length > 0) {
        throw new AppError(
            StatusCodes.CONFLICT,
            'Already enrolled in one or more selected courses.',
        );
    }

    const transactionId = uuidv4();

    const paymentData = {
        total_amount: totalPrice,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: `${config.backend_url}/api/v1/enroll-course/paid/success?trans_id=${transactionId}&course_id=${course_id.join(',')}`,
        fail_url: `${config.backend_url}/api/v1/enroll-course/paid/failed?trans_id=${transactionId}`,
        cancel_url: `${config.backend_url}/api/v1/enroll-course/paid/canceled?trans_id=${transactionId}`,
        ipn_url: `${config.backend_url}/api/v1/enroll-course/paid/ipn?trans_id=${transactionId}`,
        shipping_method: 'Courier',
        product_name: 'Courses',
        product_category: 'Education',
        product_profile: 'Paid',
        cus_name: studentDetails.name,
        cus_email: studentDetails.email,
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: studentDetails.phone,
        cus_fax: studentDetails.phone,
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(paymentData);

    if (!apiResponse || !apiResponse.GatewayPageURL) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Failed to initialize payment gateway',
        );
    }

    // Save payment information
    const payment = new Payment({
        student_id: studentDetails._id,
        paymentType: 'Paid',
        amount: totalPrice,
        transactionId,
    });
    await payment.save();

    console.log(apiResponse.GatewayPageURL);

    return apiResponse.GatewayPageURL;
};

const createPaidEnrolledCourseSuccess = async (
    trans_id: string,
    course_id: string[],
) => {
    // Update Payment Status
    const paymentDetails = await Payment.findOneAndUpdate(
        { transactionId: trans_id },
        { status: 'Success' },
        { new: true },
    );

    if (!paymentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
    }
    // Ensure student is not already enrolled in any of the courses
    const existingEnrollments = await EnrolledCourse.find({
        student_id: paymentDetails.student_id,
        course_id: { $in: course_id },
    });

    if (existingEnrollments.length > 0) {
        throw new AppError(
            StatusCodes.CONFLICT,
            'Already enrolled in one or more selected courses.',
        );
    }
    // Enroll the student in all selected courses
    const enrollments = course_id.map((course) => ({
        student_id: paymentDetails.student_id,
        course_id: course,
        enrollmentType: 'Paid',
        payment_id: paymentDetails._id,
    }));

    const enrolledCourses = await EnrolledCourse.insertMany(enrollments);

    if (!enrolledCourses || enrolledCourses.length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Failed to enroll in the courses.',
        );
    }

    // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaUpdate Student Record
    const courseIds = enrolledCourses.map((course) => course._id);
    const updatedStudent = await Student.findByIdAndUpdate(
        paymentDetails.student_id,
        {
            $push: { enrolledCourses: { $each: courseIds } },
        },
        { new: true },
    );

    if (!updatedStudent) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Failed to update student enrollment.',
        );
    }
};
const createPaidEnrolledCourseFailed = async (trans_id: string) => {
    // Step 1: Delete Payment Record
    const paymentDetails = await Payment.findOneAndDelete({
        transactionId: trans_id,
    });

    if (!paymentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
    }
};
const createPaidEnrolledCourseCanceled = async (trans_id: string) => {
    console.log('canceled');
    // Step 1: Delete Payment Record
    const paymentDetails = await Payment.findOneAndDelete({
        transactionId: trans_id,
    });

    if (!paymentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
    }
};

const getAllEnrolledCourses = async (
    filters: IEnrolledCourseFilters,
    paginationOptions: IPaginationOptions,
    userInfo: TJWTDecodedUser,
): Promise<any> => {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
            calculatePagination(paginationOptions);
    const andConditions = [];
    // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }
    
    andConditions.push({student_id:studentDetails._id})

    
        // searching data
        if (searchTerm) {
            andConditions.push({
                $or: EnrolledCourseSearchableFields.map((field) => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: 'i',
                    },
                })),
            });
        }


    // Exclude subscription courses if subscription is expired or not available
    if (!studentDetails.subscriptionEndDate || new Date(studentDetails.subscriptionEndDate) < new Date()) {
        andConditions.push({
            enrollmentType: { $ne: 'Subscription' },
        });
    }
    
        // filtering data
        if (Object.keys(filtersData).length) {
            andConditions.push({
                $and: Object.entries(filtersData).map(([field, value]) => ({
                    [field]: value,
                })),
            });
        }
        const sortConditions: { [key: string]: SortOrder } = {};
    
        if (sortBy && sortOrder) {
            sortConditions[sortBy] = sortOrder;
        }
    
        const whereConditions =
            andConditions.length > 0 ? { $and: andConditions } : {};
    
        const count = await EnrolledCourse.countDocuments(whereConditions);
        const result = await EnrolledCourse.find(whereConditions)
            .populate('course_id')
            .sort(sortConditions)
            .skip(skip)
            .limit(limit);
    
        return {
            meta: {
                page,
                limit: limit === 0 ? count : limit,
                count,
            },
            data: result,
        };
};

const getEnrolledCourseByID = async (id: string,userInfo: TJWTDecodedUser): Promise<any> => {
   // Get student details
   const studentDetails = await Student.findOne({ user_id: userInfo.userId });
   if (!studentDetails) {
       throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
   }

   // Fetch the enrolled course
   const data = await EnrolledCourse.findOne({_id:id,student_id:studentDetails._id})
       .populate('course_id')
      
   
   if (!data) {
       throw new AppError(StatusCodes.NOT_FOUND, 'You have not enrolled in this course.');
   }

   // Check subscription validity if the enrollment type is "Subscription"
   if (data.enrollmentType === 'Subscription') {
       const { subscriptionEndDate } = studentDetails;
       if (!subscriptionEndDate || new Date(subscriptionEndDate) < new Date()) {
           throw new AppError(
               StatusCodes.FORBIDDEN,
               'Subscription is either expired or not active'
           );
       }
   }

   return data;
};



export const EnrolledCourseService = {
    createFreeEnrolledCourse,
    createSubscriptionEnrolledCourse,
    createPaidEnrolledCourse,
    createPaidEnrolledCourseSuccess,
    createPaidEnrolledCourseFailed,
    createPaidEnrolledCourseCanceled,
    getAllEnrolledCourses,
    getEnrolledCourseByID,
};
