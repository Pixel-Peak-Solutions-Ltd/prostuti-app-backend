import { Model, Types } from "mongoose";
import { VoucherDiscountType, VoucherType } from "./voucher.constant";

export type IVoucher={
    title: string;
    voucherType:VoucherType
    discountType: VoucherDiscountType
    discountValue: number;
    isActive:boolean,
    isExpired:boolean
    startDate: Date;
    endDate: Date;
    student_id?:Types.ObjectId
    course_id?:Types.ObjectId
    createdBy:Types.ObjectId,
    updatedBy:Types.ObjectId
  }


  export type VoucherModel = Model<
  IVoucher,
  Record<string, unknown>
>;

export type IVoucherFilters = {
  searchTerm?: string;
  voucherType?:string,
  course?:string,
  user?:string,
  discountType?: string,
  isActive?:string,
  isExpired?:string,
  course_id?:string,
  student_id?:string,
  createdBy?:string
}