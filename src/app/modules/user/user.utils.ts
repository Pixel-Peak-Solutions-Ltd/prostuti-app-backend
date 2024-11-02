export const formattedTeacherJoiningDate = () => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('en-US', { month: 'long' });
    const day = currentDate.getDate().toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${month} ${day},${year}`;
};
