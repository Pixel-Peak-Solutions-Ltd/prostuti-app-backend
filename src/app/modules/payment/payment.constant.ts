export type PaymentType = 'Paid' | 'Subscription';
export type PaymentStatus = 'Success' | 'Failed' | 'Pending';
export type SubscriptionPlans = '1 month' | '6 months' | '1 year';

export const PaymentType: PaymentType[] = ['Paid', 'Subscription'];
export const PaymentStatus: PaymentStatus[] = ['Success', 'Failed', 'Pending'];
export const SubscriptionPlans: SubscriptionPlans[] = [
    '1 month',
    '6 months',
    '1 year',
];

export const subscriptionPlansDetails: Record<
    string,
    { durationInMonths: number; price: number }
> = {
    '1 month': { durationInMonths: 1, price: 200 },
    '6 months': { durationInMonths: 6, price: 1000 },
    '1 year': { durationInMonths: 12, price: 1800 },
};

//filter
export const PaymentFilterableFields = [
    'searchTerm',
    'student_id',
    // 'course_id',
    'paymentType',
    'status',
    'amount',
    'transactionId',
    'createdDate',
    'expireDate',
];

//searchTerm
export const PaymentSearchableFields = ['transactionId'];
