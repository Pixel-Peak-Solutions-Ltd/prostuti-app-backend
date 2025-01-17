import { Schema, model } from 'mongoose';
import { VoucherDiscountType } from './voucher.constant';
import { IVoucher, VoucherModel } from './voucher.interface';

const VoucherSchema = new Schema<IVoucher, VoucherModel>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim:true
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
        isActive:{
            type:Boolean,
            required:[true,"Activity Status is required"],
            default:true,
        },
        isExpired:{
            type:Boolean,
            required:[true,"Expired Status is required"],
            default:false,
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
