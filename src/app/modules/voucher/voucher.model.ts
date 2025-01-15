import { Schema, model } from 'mongoose';
import { IVoucher, VoucherModel } from './voucher.interface';
import { VoucherDiscountType, VoucherType } from './voucher.constant';

const VoucherSchema = new Schema<IVoucher, VoucherModel>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
        },
        discountType: {
            type: String,
            enum: VoucherDiscountType,
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        type: {
            type: String,
            enum: VoucherType,
            required: true,
            default: 'Active',
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (value: Date) {
                    return value > this.startDate;
                },
                message: 'End date must be after the start date.',
            },
        },
        student_id:{
            type:Schema.Types.ObjectId,
            required:false,
            ref:"Student"
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            default: function () {
                return this.createdBy;
            },
        },
    },
    {
        timestamps: true,
    },
);

VoucherSchema.index({ title: 1, startDate: 1 }, { unique: true });


export const Voucher = model<IVoucher, VoucherModel>('Voucher', VoucherSchema);
