import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { teacherService } from './teacher.service';

const updateTeacher = catchAsync(async (req, res) => {
    const { teacherId } = req.params;

    const result = await teacherService.updateTeacher(
        teacherId,
        req.body,
        req.user,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Teacher profile updated successfully',
        data: result,
    });
});

export const teacherController = {
    updateTeacher,
};
