import { StatusCodes } from "http-status-codes";
import AppError from "../../classes/errorClasses/AppError";
import { TJWTDecodedUser } from "../../interfaces/jwt/jwt.type";
import { IVoucher } from "./voucher.interface";
import { Voucher } from "./voucher.model";
import { User } from "../user/user.model";

const createVoucher = async ( userInfo: TJWTDecodedUser,payload: Partial<IVoucher>):Promise<any> => {
    //check user
    const checkUser = await User.findById(userInfo.userId);
    if (!checkUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }
     // Check for duplicate title and startDate combination (unique index enforcement)
     const existingVoucher = await Voucher.findOne({
        title: payload.title,
        startDate: payload.startDate,
      })

      if(existingVoucher){
        throw new AppError(StatusCodes.CONFLICT,"A voucher with this title and start date already exists.")
      }

    // Create the voucher
    const newVoucher = new Voucher({
        title:payload.title,
        discountType:payload.discountType,
        discountValue:payload.discountValue,
        startDate:payload.startDate,
        endDate:payload.endDate,
        createdBy:checkUser._id
      });
      await newVoucher.save();
      return newVoucher
    
};

const getAllVouchers = async () => {
    return 'getAllVouchers service';
};

const getVoucherByID = async () => {
    return 'getVoucherByID service';
};

const updateVoucher = async () => {
    return 'updateVoucher service';
};

const deleteVoucherByID = async () => {
    return 'deleteVoucherByID service';
};

export const VoucherService = {
    createVoucher,
    getAllVouchers,
    getVoucherByID,
    updateVoucher,
    deleteVoucherByID,
};

