export const generateOTP = (): string => {
    let otp = '';
    for (let i = 0; i < 4; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
};

export const normalizePhoneNumber = (phoneNumber: string): string => {
    // Remove any non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // If the number starts with '88', return as is
    if (digitsOnly.startsWith('88')) {
        return digitsOnly;
    }

    // If the number starts with '01', prepend '88'
    if (digitsOnly.startsWith('01')) {
        return `88${digitsOnly}`;
    }

    // If the number doesn't start with '01', assume it's missing the '88' prefix
    return `88${digitsOnly}`;
};
