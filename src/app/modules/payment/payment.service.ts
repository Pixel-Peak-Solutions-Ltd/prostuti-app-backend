import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';

import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import SSLCommerzPayment from 'sslcommerz-lts';
import config from '../../config';
import { Student } from '../student/student.model';
import { subscriptionPlansDetails } from './payment.constant';
import { Payment } from './payment.model';
import { Subscription } from '../subscription/subscription.model';

const store_id = 'bakin62b84b547d1c3';
const store_passwd = 'bakin62b84b547d1c3@ssl';
const is_live = false;

const createSubscriptionPayment = async (
    userInfo: TJWTDecodedUser,
    payload: { requestedPlan: string },
): Promise<string> => {
    const { requestedPlan } = payload;

    // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }

    if (
        studentDetails.subscriptionEndDate &&
        studentDetails.subscriptionEndDate > new Date()
    ) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Student already has an active subscription.',
        );
    }

    // Extract Plan Details
    const planDetails = subscriptionPlansDetails[requestedPlan];
    if (!planDetails) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Invalid subscription plan.',
        );
    }

    const { durationInMonths, price } = planDetails;

    // Calculate Subscription Dates
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date(subscriptionStartDate);
    subscriptionEndDate.setMonth(
        subscriptionEndDate.getMonth() + durationInMonths,
    );

    // Create Payment Record
    const transactionId = uuidv4();

    const paymentData = {
        total_amount: price,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: `${config.backend_url}/api/v1/payment/subscription/success?trans_id=${transactionId}&requestedPlan=${requestedPlan}`,
        fail_url: `${config.backend_url}/api/v1/payment/subscription/failed?trans_id=${transactionId}`,
        cancel_url: `${config.backend_url}/api/v1/payment/subscription/canceled?trans_id=${transactionId}`,
        ipn_url: `${config.backend_url}/api/v1/payment/subscription/ipn?trans_id=${transactionId}`,
        shipping_method: 'Courier',
        product_name: 'Courses',
        product_category: 'Education',
        product_profile: 'Subscription',
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
        paymentType: 'Subscription',
        amount: price,
        transactionId,
        expireDate: subscriptionEndDate,
    });
    await payment.save();

    console.log(apiResponse.GatewayPageURL);

    return apiResponse.GatewayPageURL;
};

const createSubscriptionPaymentSuccess = async (
    trans_id: string,
    requestedPlan: string,
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
    const newSubscription = new Subscription({
        student_id: paymentDetails.student_id,
        payment_id: paymentDetails._id,
        subscriptionPlan: requestedPlan,
        price: paymentDetails.amount,
        status: 'Active',
        endDate: paymentDetails.expireDate,
    });
    await newSubscription.save();

    const updateStudentDetails = await Student.findByIdAndUpdate(
        paymentDetails.student_id,
        {
            subscriptionStartDate: new Date(),
            subscriptionEndDate: paymentDetails.expireDate,
        },
        { new: true },
    );
    if (!updateStudentDetails) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Failed to update student subscription details.',
        );
    }
};
const createSubscriptionPaymentFailed = async (trans_id: string) => {
    // Delete Payment Record
    const paymentDetails = await Payment.findOneAndDelete({
        transactionId: trans_id,
    });

    if (!paymentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
    }
};
const createSubscriptionPaymentCanceled = async (trans_id: string) => {
    // Delete Payment Record
    const paymentDetails = await Payment.findOneAndDelete({
        transactionId: trans_id,
    });

    if (!paymentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found.');
    }
};

export const PaymentService = {
    createSubscriptionPayment,
    createSubscriptionPaymentSuccess,
    createSubscriptionPaymentFailed,
    createSubscriptionPaymentCanceled,
};
