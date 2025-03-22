import { Types } from 'mongoose';
import { z } from 'zod';

const createFlashcard = z.object({
    body: z
        .object({
            title: z
                .string()
                .min(3, 'Title must be at least 3 characters long')
                .max(100, 'Title cannot exceed 100 characters'),
            visibility: z.enum(['ONLY_ME', 'EVERYONE'], {
                required_error: 'Visibility is required',
            }),
            categoryId: z.string({ required_error: 'Category ID is required' }).refine(
                (val) => Types.ObjectId.isValid(val),
                { message: 'Invalid Category ID' }
            ),
            items: z
                .array(
                    z.object({
                        term: z
                            .string()
                            .min(
                                1,
                                'Question must be at least 1 character long',
                            ),
                        answer: z
                            .string()
                            .min(1, 'Answer must be at least 1 character long'),
                    }),
                )
                .min(1, 'At least one flashcard item is required'),
        })
        .strict(),
});
export const FlashcardValidation={createFlashcard}