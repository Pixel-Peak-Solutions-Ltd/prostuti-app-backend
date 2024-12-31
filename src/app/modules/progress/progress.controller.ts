import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import { progressService } from "./progress.service";
import { RecodedClass } from "../courseManagement/recodedClass/recodedClass.model";
import { Assignment } from "../courseManagement/assignment/assignment.model";
import { Resource } from "../courseManagement/resource/resource.model";
import { Test } from "../courseManagement/test/test.model";
import { Types } from "mongoose";
import { EnrolledCourse } from "../enrolledCourse/enrolledCourse.model";
import { Student } from "../student/student.model";
import { courseService } from "../courseManagement/course/course.service";

const createProgress = catchAsync(async (req, res) => {
    const { userId } = req.user;

    const payload = {
        user_id: userId,
        ...req.body,
    }

    // for record class
    if (payload.materialType === 'record') {
        const record = await RecodedClass.findById(
            { _id: payload.material_id }
        )
        payload.course_id = record?.course_id;
    };
    // for assignment
    if (payload.materialType === 'assignment') {
        const record = await Assignment.findById(
            { _id: payload.material_id }
        )
        payload.course_id = record?.course_id;
    };
    // for resources
    if (payload.materialType === 'resource') {
        const record = await Resource.findById(
            { _id: payload.material_id }
        )

        payload.course_id = record?.course_id;
    };
    // for tests
    if (payload.materialType === 'test') {
        const record = await Test.findById(
            { _id: payload.material_id }
        )
        payload.course_id = record?.course_id;
    };

    const result = await progressService.createProgressToDB(payload);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: `${req.body.materialType} marked as completed`,
        data: result,
    });
})


const getAllProgressFromDB = catchAsync(async (req, res) => {
    const result = await progressService.getAllProgressFromDB();
    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: `Completed Progress`,
        data: result,
    });
})

const getProgressByStudentAndCourseId = catchAsync(async (req, res) => {
    const { userId } = req.user;
    const { courseId } = req.params

    const result = await progressService.getProgressByStudentIdFromDB(userId, courseId);

    let materialIds: Types.ObjectId[] = [];

    if (result.length !== 0) {
        materialIds = [...result.map((material) => material?.material_id)]
    }

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: `Completed Progress`,
        data: materialIds,
    });
})


const courseProgress = catchAsync(async (req, res) => {
    const { userId } = req.user;

    // step 1 : narrowing down the student's id from student database with userId 
    const student = await Student.findOne({ user_id: userId });

    // step 2: getting all the enrolled course by the student via student id

    const userEnrolledCourses = await EnrolledCourse.find(
        { student_id: student?._id }
    )

    // step 3: storing all the enrolled course Ids in an array
    let enrolledCourseIds: string[] = [];

    if (userEnrolledCourses.length > 0) {
        enrolledCourseIds = [...userEnrolledCourses.map((course) => String(course?.course_id._id))];
    }

    const percentagePerCourseId: any = {};

    for (const key of enrolledCourseIds) {
        // console.log('sent ids:', key, userId);
        let completedStudentMaterialsId: any = [];
        const course = await courseService.getCoursePreview(key.toString());

        // step 4: saving the total number of materials of a course enrolled by the student via course preview api call
        const totalMaterials = (course?.totalRecodedClasses as number) + (course?.totalResources as number) + (course?.totalAssignments as number) + (course?.totalTests as number);

        // step 5: fetching the completed course materials from student progress collection

        const completedStudentMaterials = await progressService.getProgressByStudentIdFromDB(userId, key);


        // checking whether completed course material object has data
        if (completedStudentMaterials.length > 0 || !completedStudentMaterials) {
            // extracting only ids of completed course materials and storing them in an array
            completedStudentMaterialsId = [...completedStudentMaterials.map((material) => String(material.material_id))];
        }

        // step 6: calculating the percentage of completed materials 
        if (completedStudentMaterialsId.length > 0) {
            percentagePerCourseId[key] = (Math.floor((completedStudentMaterialsId.length * 100) / totalMaterials));
        } else {
            // storing 0 as a percentage value for non existent completed materials
            percentagePerCourseId[key] = 0;
        }

    }

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: `Completed Progress`,
        data: percentagePerCourseId,
    });
})

export const progressController = {
    createProgress,
    getAllProgressFromDB,
    getProgressByStudentAndCourseId,
    courseProgress
}