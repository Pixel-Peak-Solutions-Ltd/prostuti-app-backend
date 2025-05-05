import { model, Schema } from "mongoose";
import { TFavouriteQuestion } from "./favouriteQuestion.interface";

const favouriteQuestionSchema = new Schema<TFavouriteQuestion>({
    student_id: {
        type: Schema.Types.ObjectId,
        ref:"Student",
        required: true
    },
    favourite_questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }]
})

export const FavouriteQuestion = model<TFavouriteQuestion>('FavoriteQuestion', favouriteQuestionSchema);