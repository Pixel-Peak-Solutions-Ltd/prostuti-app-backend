export type VoucherDiscountType = 'Amount' | 'Percentage';
// export type VoucherType = 'Active' | 'Disabled' | 'Expired';

export const VoucherDiscountType: VoucherDiscountType[] = [
    'Amount',
    'Percentage',
];
// export const VoucherType: VoucherType[] = ['Active', 'Disabled', 'Expired'];

//filter
export const VoucherFilterableFields = [
    'searchTerm',
    'discountType',
    'isActive',
    'isExpired',
    'student_id',
    'createdBy',
];

//searchTerm
export const VoucherSearchableFields = ['title'];
