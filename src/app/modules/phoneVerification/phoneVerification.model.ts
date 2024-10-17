import { Schema, model } from 'mongoose';
import { PHONE_VERIFICATION_TYPE } from './phoneVerification.constant';
import { IPhoneVerification } from './phoneVerification.interface';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import config from '../../config';

// Student Schema
const phoneVerificationSchema = new Schema<IPhoneVerification>(
    {
        phoneNumber: {
            type: String,
            required: true,
        },
        otpCode: {
            type: String,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        phoneVerificationType: {
            type: String,
            enum: {
                values: Object.values(PHONE_VERIFICATION_TYPE),
                message: `{VALUE} is not a valid phone verification type.Type must be anything from this: ${Object.values(PHONE_VERIFICATION_TYPE)}`,
            },
            required: [true, 'phoneVerificationType is required'],
        },
        verifiedAt: {
            type: Date,
        },

        expireAt: {
            type: Date,
            default: () =>
                new Date(Date.now() + Number(config.otp_Expiration_Time)),
        },
    },

    {
        timestamps: true,
        versionKey: false,
    },
);

// Pre-save middleware to format the phone number
phoneVerificationSchema.pre('save', function (next) {
    if (this.phoneNumber && this.isModified('phoneNumber')) {
        this.phoneNumber = formatPhoneNumber(this.phoneNumber);
    }
    next();
});

// Create a conditional TTL index that only applies to unverified documents
phoneVerificationSchema.index(
    { expireAt: 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: { verified: false },
    },
);

// Pre-save middleware to set `verifiedAt` when the document is verified
phoneVerificationSchema.pre('save', function (next) {
    if (this.isModified('verified') && this.verified) {
        this.verifiedAt = new Date();
    }
    next();
});

// Create a TTL index on `verifiedAt` to delete verified documents after 5 minutes
phoneVerificationSchema.index(
    { verifiedAt: 1 },
    {
        expireAfterSeconds: process.env.VERIFIED_PHONE_DOC_EXPIRATION,
        partialFilterExpression: { verified: true },
    },
);

// Create a Model
export const PhoneVerification = model<IPhoneVerification>(
    'PhoneVerification',
    phoneVerificationSchema,
);
