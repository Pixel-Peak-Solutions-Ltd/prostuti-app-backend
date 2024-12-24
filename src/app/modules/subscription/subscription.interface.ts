import { Model, Types } from 'mongoose';
import { SubscriptionPlans } from '../payment/payment.constant';

export type ISubscription = {
    student_id: Types.ObjectId;
    payment_id: Types.ObjectId;
    subscriptionPlan: SubscriptionPlans;
    price: number;
    status: 'Active' | 'Expired' | 'Cancelled';
    startDate: Date;
    endDate: Date;
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;

export type ISubscriptionFilters = {
    searchTerm?: string;
};
