import { Schema, model } from 'mongoose';
import { ISubscription, SubscriptionModel } from './subscription.interface';
import { SubscriptionPlans } from '../payment/payment.constant';

const SubscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
    {
        student_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Student',
        },
        payment_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Payment',
        },
        subscriptionPlan: {
            type: String,
            required: true,
            enum: SubscriptionPlans,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['Active', 'Expired', 'Cancelled'],
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

SubscriptionSchema.index({ endDate: 1 });

export const Subscription = model<ISubscription, SubscriptionModel>(
    'Subscription',
    SubscriptionSchema,
);
