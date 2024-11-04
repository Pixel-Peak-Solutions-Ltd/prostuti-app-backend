import { z } from "zod";


const createFavouriteQuestionValidationSchema = z.object({
    // body: z.object({
    //     student_id: z.instanceof(mongoose.Types.ObjectId, {
    //         message: 'Student ID must be provided'
    //     }),
    //     questions: z.array(z.instanceof(mongoose.Types.ObjectId), {
    //         required_error: 'Provide an ObjectId',
    //         message: 'Each item must be a valid ObjectId'
    //     })
    // })
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