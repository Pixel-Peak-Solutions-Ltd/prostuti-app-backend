import { z } from "zod";


const createFavouriteQuestionValidationSchema = z.object({
    body: z.object({
        favourite_questions: z.string({
            required_error: 'Provide an ObjectId',
            message: 'Must be a valid ObjectId'
        })
    })
})

export const favouriteQuestionValidation = {
    createFavouriteQuestionValidationSchema
}