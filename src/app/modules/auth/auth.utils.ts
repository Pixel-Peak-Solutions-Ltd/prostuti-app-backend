export const convertJWTExpireTimeToSeconds = (timeString: string) => {
    const lastChar = timeString.slice(-1);

    if (['m', 'h', 'd'].includes(lastChar)) {
        const value = parseInt(timeString.slice(0, -1));
        switch (lastChar) {
            case 'm':
                return value * 60;
            case 'h':
                return value * 3600;
            case 'd':
                return value * 86400;
        }
    } else {
        return parseInt(timeString);
    }
};
