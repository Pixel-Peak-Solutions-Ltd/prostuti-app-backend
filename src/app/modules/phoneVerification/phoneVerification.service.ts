const sendVerificationCode = async (phoneNumber: string) => {
    return phoneNumber;
};

const verifyPhoneNumber = async (phoneNumber: string, code: string) => {
    return { phoneNumber, code };
};

export const phonVerificationService = {
    sendVerificationCode,
    verifyPhoneNumber,
};
