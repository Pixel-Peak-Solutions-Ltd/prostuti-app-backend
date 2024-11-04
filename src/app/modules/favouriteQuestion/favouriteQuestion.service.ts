import { TFavouriteQuestion } from "./favouriteQuestion.interface";
import { FavouriteQuestion } from "./favouriteQuestion.model"

const createFavouriteQuestionToDB = async (payload: TFavouriteQuestion) => {

    // step1: first check if there is already an existing favourite question document based on the student id
    const existingFavouties = await FavouriteQuestion.findOne({ student_id: payload.student_id });

    if (!existingFavouties) {
        const result = await FavouriteQuestion.create(payload);
        return result;
    } else {
        const result = await FavouriteQuestion.findByIdAndUpdate(
            { _id: existingFavouties._id },
            { $push: { favourite_questions: payload.favourite_questions } }
        )
        return result;
    }

}

const getFavouriteQuestionsFromDB = async (payload: string) => {
    const result = await FavouriteQuestion.find({ student_id: payload }).populate('favourite_questions');
    return result;
}

const deleteFavouriteQuestionsFromDB = async (payload: { student_id: string; question_id: string }) => {
    const existingFavouties = await FavouriteQuestion.findOne({ student_id: payload.student_id });

    if (existingFavouties?.favourite_questions.length === 0) {
        return `You don't have any favourite question`;

    } else {
        const result = await FavouriteQuestion.updateOne({ _id: existingFavouties?._id }, { $pull: { favourite_questions: payload.question_id } });
        return result;
    }
}

export const favouriteQuestionService = {
    createFavouriteQuestionToDB,
    getFavouriteQuestionsFromDB,
    deleteFavouriteQuestionsFromDB
};
