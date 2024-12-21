export type PaymentType = 'Paid' | 'Subscription';
export type PaymentStatus = 'Success' | 'Failed' | 'Pending';



export const PaymentType: PaymentType[] = ['Paid' , 'Subscription'];
export const PaymentStatus: PaymentStatus[] = ['Success' , 'Failed' , 'Pending'];


//filter
export const PaymentFilterableFields = [
    'searchTerm',
    'student_id',
    'course_id',
    'paymentType',
    'status',
    'createdDate',
    'expireDate',
];

//searchTerm
export const PaymentSearchableFields = [];