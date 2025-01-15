import { Model, Types } from "mongoose";
import { VoucherDiscountType, VoucherType } from "./voucher.constant";

export type IVoucher={
    title: string;
    discountType: VoucherDiscountType
    discountValue: number;
    type: VoucherType;
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
  type?:string,
  createdBy?:Types.ObjectId
}