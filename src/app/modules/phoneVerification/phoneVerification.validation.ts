import { z } from 'zod';
import { PHONE_VERIFICATION_TYPE } from './phoneVerification.constant';

const sendVerificationCodeValidationSchema = z.object({
    body: z.object({
        phoneNumber: z
            .string({
                required_error: 'Phone number is required',
                invalid_type_error: 'Phone number must be a string',
            })
            .regex(
                /^(\+?880|0)1[3456789]\d{8}$/,
                'Invalid Bangladeshi phone number',
            )
            .min(11, 'Phone number must be at least 11 characters')
            .max(14, 'Phone number must not exceed 14 characters'),

        phoneVerificationType: z.enum(
            Object.values(PHONE_VERIFICATION_TYPE) as [string, ...string[]],
            {
                errorMap: (issue, ctx) => {
                    if (issue.code === 'invalid_enum_value') {
                        return {
                            message: `Invalid phone verification type. Allowed values are: ${Object.values(PHONE_VERIFICATION_TYPE).join(', ')}`,
                        };
                    }
                    return { message: ctx.defaultError };
                },
            },
        ),
    }),
});

const verifyPhoneValidationSchema = z.object({
    body: z.object({
        phoneNumber: z
            .string({
                required_error: 'Phone number is required',
                invalid_type_error: 'Phone number must be a string',
            })
            .regex(
                /^(\+?880|0)1[3456789]\d{8}$/,
                'Invalid Bangladeshi phone number',
            )
            .min(11, 'Phone number must be at least 11 characters')
            .max(14, 'Phone number must not exceed 14 characters'),

        code: z.string({
            required_error: 'Code number is required',
            invalid_type_error: 'Code must be a string',
        }),

        phoneVerificationType: z.enum(
            Object.values(PHONE_VERIFICATION_TYPE) as [string, ...string[]],
            {
                errorMap: (issue, ctx) => {
                    if (issue.code === 'invalid_enum_value') {
                        return {
                            message: `Invalid phone verification type. Allowed values are: ${Object.values(PHONE_VERIFICATION_TYPE).join(', ')}`,
                        };
                    }
                    return { message: ctx.defaultError };
                },
            },
        ),
    }),
});

export const phoneVerificationValidator = {
    sendVerificationCodeValidationSchema,
    verifyPhoneValidationSchema,
};
