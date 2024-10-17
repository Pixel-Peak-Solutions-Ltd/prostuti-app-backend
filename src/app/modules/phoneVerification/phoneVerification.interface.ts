import { PHONE_VERIFICATION_TYPE } from './phoneVerification.constant';

export type TPhoneVerificationType = keyof typeof PHONE_VERIFICATION_TYPE;

export interface IPhoneVerification {
    phoneNumber: string;
    otpCode: string;
    verified: boolean;
    phoneVerificationType: TPhoneVerificationType;
    verifiedAt: Date;
    expireAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
