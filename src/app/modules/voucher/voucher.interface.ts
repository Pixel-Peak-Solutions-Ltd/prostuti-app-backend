import { Model, Types } from "mongoose";
import { VoucherDiscountType } from "./voucher.constant";

export type IVoucher={
    title: string;
    discountType: VoucherDiscountType
    discountValue: number;
    isActive:boolean,
    isExpired:boolean
    startDate: Date;
    endDate: Date;
    student_id?:Types.ObjectId
    createdBy:Types.ObjectId,
    updatedBy:Types.ObjectId
  }


  export type VoucherModel = Model<
  IVoucher,
  Record<string, unknown>
>;

export type IVoucherFilters = {
  searchTerm?: string;
  discountType?: string,
  isActive?:string,
  isExpired?:string,
  createdBy?:string
}