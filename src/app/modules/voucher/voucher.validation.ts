import { z } from 'zod';
import { VoucherDiscountType } from './voucher.constant';

const createVoucherSchema = z.object({
    body: z
        .object({
            title: z.string().min(1, 'Title is required'),
            discountType: z.enum(
                [...VoucherDiscountType] as [string, ...string[]],
                {
                    required_error: 'Test type is required.',
                },
            ),
            discountValue: z
                .number({ required_error: 'Discount value is required' })
                .min(0, { message: 'Discount value must be 0 or greater' }),
            startDate: z
                .string()
                .datetime({ message: 'Invalid date format' })
                .min(1, 'Start date is required'),
            endDate: z
                .string()
                .datetime({ message: 'Invalid date format' })
                .min(1, 'End date is required'),
        })
        .strict(),
});
export const VoucherValidation = { createVoucherSchema };
