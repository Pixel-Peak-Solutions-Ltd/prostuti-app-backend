import { PHONE_VERIFICATION_TYPE } from './phoneVerification.constant';

export type TPhoneVerificationType = keyof typeof PHONE_VERIFICATION_TYPE;

export interface IPhoneVerification {
    phoneNumber: string;
    verified: boolean;
    phoneVerificationType: TPhoneVerificationType;
}
