import { Model, Types } from 'mongoose';
import { PaymentStatus, PaymentType } from './payment.constant';

export type IPayment = {
    student_id: Types.ObjectId;
    // course_id: Types.ObjectId;
    paymentType: PaymentType;
    amount: number;
    status: PaymentStatus;
    isVoucherAdded: boolean;
    voucher_id?: Types.ObjectId;
    transactionId: string;
    createdDate: Date;
    expireDate?: Date;
};

export type PaymentModel = Model<IPayment, Record<string, unknown>>;

export type IPaymentFilters = {
    searchTerm?: string;
    student_id?: string;
    // course_id?: string;
    paymentType?: string;
    status?: string;
    amount?: string;
    transactionId?: string;
    createdDate?: string;
    expireDate?: string;
    isVoucherAdded?: string;
    voucher_id?: string;
};
