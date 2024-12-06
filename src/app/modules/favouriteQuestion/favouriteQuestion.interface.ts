import { Types } from "mongoose";

export type TFavouriteQuestion = {
    student_id: Types.ObjectId;
    favourite_questions: Types.ObjectId[];
}