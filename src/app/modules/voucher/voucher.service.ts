import { StatusCodes } from 'http-status-codes';
import { SortOrder, Types } from 'mongoose';
import AppError from '../../classes/errorClasses/AppError';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../interfaces/common';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Course } from '../courseManagement/course/course.model';
import { Student } from '../student/student.model';
import { User } from '../user/user.model';
import { VoucherSearchableFields, VoucherType } from './voucher.constant';
import { IVoucher, IVoucherFilters } from './voucher.interface';
import { Voucher } from './voucher.model';

const createVoucher = async (
    userInfo: TJWTDecodedUser,
    payload: Partial<IVoucher>,
): Promise<IVoucher> => {
    //check user
    const checkUser = await User.findById(userInfo.userId);
    if (!checkUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }
    // Check for duplicate title and startDate combination (unique index enforcement)
    const existingVoucher = await Voucher.findOne({
        title: payload.title,
        startDate: payload.startDate,
    });

    if (existingVoucher) {
        throw new AppError(
            StatusCodes.CONFLICT,
            'A voucher with this title and start date already exists.',
        );
    }

    if (payload.student_id) {
        const student = await Student.findById(payload.student_id);
        if (!student) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                `Student not found for Student_id: ${payload.student_id}`,
            );
        }
    }
    if (payload.course_id) {
        const course = await Course.findById(payload.course_id);
        if (!course) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                `Course not found`,
            );
        }
    }
    let voucherType:VoucherType=payload.student_id?"Specific_Student":payload.course_id?"Specific_Course":"All_Course"

    // Create the voucher
    const newVoucher = new Voucher({
        title: payload.title,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        startDate: payload.startDate,
        endDate: payload.endDate,
        voucherType:voucherType,
        ...(payload.student_id && {
            student_id: new Types.ObjectId(payload.student_id),
        }),
        ...(payload.course_id && {
            course_id: new Types.ObjectId(payload.course_id),
        }),
        createdBy: checkUser._id,
    });
    await newVoucher.save();
    return newVoucher;
};

const getAllVouchers = async (
    filters: IVoucherFilters,
    paginationOptions: IPaginationOptions,
) => {
    const { searchTerm,course,user, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    const andConditions = [];
   
    if (searchTerm) {
        andConditions.push({
            $or: VoucherSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }
    // Handle course filter
    if (course) {
        andConditions.push({
            $or: [
                { voucherType: "All_Course" },
                { voucherType: "Specific_Course" }
            ]
        });
    }

    // Handle user filter
    if (user) {
        andConditions.push({
            voucherType: "Specific_Student"
        });
    }


    // filtering data
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => ({
                [field]: value,
            })),
        });
    }

    const sortConditions: { [key: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder;
    }

    const whereConditions =
        andConditions.length > 0 ? { $and: andConditions } : {};

    const count = await Voucher.countDocuments(whereConditions);
    const result = await Voucher.find(whereConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'student_id',
        })
        .populate({
            path: 'course_id',
            populate: {
                path: 'category_id', 
            },
        })
        .populate({
            path: 'createdBy',
        });

    return {
        meta: {
            page,
            limit: limit === 0 ? count : limit,
            count,
        },
        data: result,
    };
};

const getVoucherByID = async (id: string) => {
    const data = await Voucher.findById(id)
        .populate('student_id')
        .populate('createdBy');
    if (!data) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Voucher not found');
    }
    return data;
};

const updateVoucher = async (id: string,userInfo: TJWTDecodedUser,payload:Partial<IVoucher>) => {
    const voucher = await Voucher.findById(id);
    if (!voucher) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Voucher not found');
    }
    const checkUser = await User.findById(userInfo.userId);
    if (!checkUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }

    const updatedVoucher = await Voucher.findByIdAndUpdate(
        id,
        {
            ...(payload.title && { title: payload.title }),
            ...(payload.discountType && { discountType: payload.discountType }),
            ...(payload.discountValue !== undefined && { discountValue: payload.discountValue }),
            ...(payload.startDate && { startDate: new Date(payload.startDate) }),
            ...(payload.endDate && { endDate: new Date(payload.endDate) }),
            ...(payload.student_id && { student_id: payload.student_id }),
            ...(payload.course_id && { course_id: payload.course_id }),
            ...(payload.isActive !== undefined && { isActive: payload.isActive }),
            updatedBy: checkUser._id,
            updatedAt: new Date(),
        },
        { new: true },
    )
        .populate('student_id')
        .populate('createdBy');

    if (!updatedVoucher) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Failed to update the voucher',
        );
    }

    return updatedVoucher;
};

const deleteVoucherByID = async (id:string,userInfo: TJWTDecodedUser) => {
    const voucher = await Voucher.findById(id);
    if (!voucher) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Voucher not found');
    }
    const checkUser = await User.findById(userInfo.userId);
    if (!checkUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }

    const deletedVoucher = await Voucher.deleteOne({ _id: id });
    
    return deletedVoucher;

};

export const VoucherService = {
    createVoucher,
    getAllVouchers,
    getVoucherByID,
    updateVoucher,
    deleteVoucherByID,
};
