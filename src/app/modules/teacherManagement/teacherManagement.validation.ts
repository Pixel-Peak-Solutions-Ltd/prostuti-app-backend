import { z } from 'zod';
import { ASSIGNED_WORKS } from '../teacher/teacher.constant';
import { ObjectId } from 'mongodb';

const updateTeacherAssignedWorksValidationSchema = z.object({
    body: z.object({
        assignedWorks: z.array(z.string()).refine(
            (works) => {
                const allowedWorks = Object.values(ASSIGNED_WORKS) as string[];
                return works.every((work) => allowedWorks.includes(work));
            },
            {
                message: `Each assigned work must be one of: ${Object.values(ASSIGNED_WORKS).join(', ')}`,
            },
        ),

        teacherProfileId: z.string().refine(
            (id) => {
                // Check if string is a valid MongoDB ObjectId
                return ObjectId.isValid(id);
            },
            {
                message: 'Invalid MongoDB ObjectId format for teacherProfileId',
            },
        ),
    }),
});

export const teacherManagementValidator = {
    updateTeacherAssignedWorksValidationSchema,
};
