export const formatPhoneNumber = (phoneNumber: string) => {
    // Remove any non-digit characters
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    // Check if the number starts with '880' or '01'
    if (cleanedNumber.startsWith('880')) {
        // If the number already starts with '880', keep it as is
        return `+${cleanedNumber}`;
    } else if (cleanedNumber.startsWith('0')) {
        // If the number starts with '0', replace it with '880'
        return `+880${cleanedNumber.slice(1)}`;
    } else {
        return phoneNumber;
    }
};
