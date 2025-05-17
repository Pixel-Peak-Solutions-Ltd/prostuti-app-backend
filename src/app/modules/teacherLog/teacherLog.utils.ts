import { Request } from 'express';
import { TeacherLog } from './teacherLog.model';


export const createTeacherLog = async (
    req: Request,
    teacher_id: string,
    action: string,
    description?: string,
) => {
    try {
        // Extract IP address and user agent from request
        const ipAddress = req.ip ?? 'unknown';
        const userAgent = req.get('User-Agent') ?? 'unknown';

        // Create log entry
        const log = new TeacherLog({
            teacher_id: teacher_id,
            action: action,
            description: description ?? "No Description",
            ipAddress,
            userAgent,
        });

        await log.save();
    } catch (error) {
        console.error('Error adding to teacher log:', error);
        throw error;
    }
};
