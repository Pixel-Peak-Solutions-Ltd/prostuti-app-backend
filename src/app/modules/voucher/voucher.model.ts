import { Schema, model } from 'mongoose';
import { VoucherDiscountType, VoucherType } from './voucher.constant';
import { IVoucher, VoucherModel } from './voucher.interface';

const VoucherSchema = new Schema<IVoucher, VoucherModel>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim:true
        },
        voucherType: {
            type: String,
            enum: VoucherType,
            required: true,
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
            validate: {
                validator: function(value: number) {
                  return this.discountType === "Percentage" ? value <= 100 : true;
                },
                message: 'Percentage discount cannot exceed 100%'
              }
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
            required: function(this: IVoucher) {
                return this.voucherType === "Specific_Student";
              },
            ref:"Student"
        },
        course_id:{
            type:Schema.Types.ObjectId,
            required: function(this: IVoucher) {
                return this.voucherType === "Specific_Course";
              },
            ref:"Course"
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
