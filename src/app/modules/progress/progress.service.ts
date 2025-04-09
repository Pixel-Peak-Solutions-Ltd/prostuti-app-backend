import { StatusCodes } from "http-status-codes";
import AppError from "../../classes/errorClasses/AppError";
import { IStudentProgress } from "./progress.interface"
import { StudentProgress } from "./progress.model"

const createProgressToDB = async (payload: IStudentProgress) => {
    const existingStudentProgress = await StudentProgress.find(
        { user_id: payload.user_id, material_id: payload.material_id }
    );

    console.log('from service', existingStudentProgress);

    // checking whether material is already marked as complete
    if (existingStudentProgress.length > 0) {
        throw new AppError(
            StatusCodes.CONFLICT,
            `${payload.materialType} is already marked as complete`
        )
    }

    const markAsCompete = await StudentProgress.create(payload);

    return markAsCompete;
}


const getAllProgressFromDB = async () => {
    const allProgress = await StudentProgress.find({}).populate('user_id');
    return allProgress;
}

const getProgressByStudentIdFromDB = async (user_id: string, course_id: string) => {

    const getSingleMaterialProgressStatus = await StudentProgress.find(
        { user_id: user_id, course_id: course_id },
    );

    return getSingleMaterialProgressStatus;
}

// const courseProgressInPercent = async (user_id:string , course_id: string) => {
//     const completedCourseNumber = await StudentProgress.find({ user_id: user_id, course_id: course_id });
//     console.log(completedCourseNumber);
// }
export const progressService = {
    createProgressToDB,
    getAllProgressFromDB,
    getProgressByStudentIdFromDB,
    // courseProgressInPercent
}