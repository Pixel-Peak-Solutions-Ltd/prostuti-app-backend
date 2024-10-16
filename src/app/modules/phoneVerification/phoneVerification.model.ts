import { Schema, model } from 'mongoose';
import { PHONE_VERIFICATION_TYPE } from './phoneVerification.constant';
import { IPhoneVerification } from './phoneVerification.interface';

// Student Schema
const phoneVerificationSchema = new Schema<IPhoneVerification>(
    {
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        phoneVerificationType: {
            enum: {
                values: Object.values(PHONE_VERIFICATION_TYPE),
                message: `{VALUE} is not a valid phone verification type.Type must be anything from this: ${Object.values(PHONE_VERIFICATION_TYPE)}`,
            },
            required: [true, 'phoneVerificationType is required'],
        },
    },

    {
        timestamps: true,
        versionKey: false,
    },
);

// Create a Model
export const Student = model<IPhoneVerification>(
    'PhoneVerification',
    phoneVerificationSchema,
);
