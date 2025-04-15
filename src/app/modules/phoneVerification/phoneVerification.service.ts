import AppError from '../../classes/errorClasses/AppError';
import config from '../../config';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import { User } from '../user/user.model';
import { PHONE_VERIFICATION_TYPE } from './phoneVerification.constant';
import { TPhoneVerificationType } from './phoneVerification.interface';
import { PhoneVerification } from './phoneVerification.model';
import { generateOTP, normalizePhoneNumber } from './phoneVerification.utils';

const sendVerificationCode = async (
    phoneNumber: string,
    phoneVerificationType: TPhoneVerificationType,
) => {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    // Check if the phone number exists in the database for PASSWORD_RESET
    if (phoneVerificationType === PHONE_VERIFICATION_TYPE.PASSWORD_RESET) {
        const userExists = await User.exists({
            phone: formatPhoneNumber(phoneNumber),
        });

        if (!userExists) {
            throw new AppError(404, 'User not found with this phone number');
        }
    }

    // Check if the phone number exists in the database for account creation
    if (phoneVerificationType === PHONE_VERIFICATION_TYPE.ACCOUNT_CREATION) {
        const userExists = await User.exists({
            phone: formatPhoneNumber(phoneNumber),
        });

        if (userExists) {
            throw new AppError(
                404,
                'User already exists with this phone number',
            );
        }
    }

    const otpCode = generateOTP();
    const apiKey = process.env.ALPHA_SMS_API_KEY;
    const message = `Your Prostuti verification code is: ${otpCode}`;
    const url = `https://api.sms.net.bd/sendsms?api_key=${apiKey}&msg=${encodeURIComponent(message)}&to=${normalizedPhoneNumber}`;

    // Send sms sending request to alpha sms server
    const response = await fetch(url);
    if (!response.ok) {
        throw new AppError(500, 'Failed to send SMS');
    }
    const result = await response.json();
    if (result.error !== 0) {
        throw new AppError(500, 'SMS service returned an error');
    }

    // Save to database
    await PhoneVerification.create({
        phoneNumber,
        otpCode,
        phoneVerificationType,
    });
    return { request_id: result.data.request_id };
};

const verifyPhoneNumber = async (
    phoneNumber: string,
    otpCode: string,
    phoneVerificationType: TPhoneVerificationType,
): Promise<{ verified: boolean }> => {
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    const verification = await PhoneVerification.findOne({
        phoneNumber: formattedPhoneNumber,
        phoneVerificationType,
        verified: false,
    }).sort({ createdAt: -1 });

    if (!verification) {
        throw new AppError(
            404,
            'No pending verification found for this phone number and verification type',
        );
    }

    if (verification.otpCode !== otpCode) {
        throw new AppError(400, 'Invalid verification code');
    }

    // Check if the OTP has expired
    if (
        Date.now() - verification.createdAt.getTime() >
        Number(config.otp_Expiration_Time) // in milliseconds
    ) {
        throw new AppError(400, 'Verification code has expired');
    }

    // Mark as verified
    verification.verified = true;
    await verification.save();

    return { verified: true };
};

export const phonVerificationService = {
    sendVerificationCode,
    verifyPhoneNumber,
};
