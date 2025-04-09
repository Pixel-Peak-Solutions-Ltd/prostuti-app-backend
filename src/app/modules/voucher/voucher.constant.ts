export type VoucherDiscountType = 'Amount' | 'Percentage';
export type VoucherType = 'All_Course' | 'Specific_Course' | 'Specific_Student';

export const VoucherDiscountType: VoucherDiscountType[] = [
    'Amount',
    'Percentage',
];
export const VoucherType: VoucherType[] = ['All_Course', 'Specific_Course', 'Specific_Student'];

//filter
export const VoucherFilterableFields = [
    'searchTerm',
    'discountType',
    'isActive',
    'isExpired',
    'student_id',
    'createdBy',
    'voucherType',
    "course",
    "user",
    'course_id',
    'student_id'
];

//searchTerm
export const VoucherSearchableFields = ['title'];
