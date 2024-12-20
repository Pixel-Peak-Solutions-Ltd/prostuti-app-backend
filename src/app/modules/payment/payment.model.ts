import { Schema, model } from 'mongoose';
import { IPayment, PaymentModel } from './payment.interface';
import { PaymentStatus, PaymentType } from './payment.constant';

const PaymentSchema = new Schema<IPayment, PaymentModel>(
    {
        student_id: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student id id required'],
        },
        // course_id: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'Course',
        //     required: [true, 'Course Id is required'],
        // },
        paymentType: {
            type: String,
            enum: PaymentType,
            required: true,
        },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: PaymentStatus,
            default: 'Pending',
        },
        transactionId: { type: String, required: true, unique: true },
        createdDate: { type: Date, default: Date.now },
        expireDate: { type: Date },
    },
    {
        timestamps: true,
    },
);

export const Payment = model<IPayment, PaymentModel>('Payment', PaymentSchema);
