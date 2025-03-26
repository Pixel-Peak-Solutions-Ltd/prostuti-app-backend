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
            categoryId: z
                .string({ required_error: 'Category ID is required' })
                .refine((val) => Types.ObjectId.isValid(val), {
                    message: 'Invalid Category ID',
                }),
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

const updateItemSchema = z
    .object({
        id: z.string(),
        term: z.string().optional(),
        answer: z.string().optional(),
    })
    .refine((data) => data.term !== undefined || data.answer !== undefined, {
        message:
            'At least one of term or answer must be provided when id is present',
    });

const newItemSchema = z.object({
    id: z.undefined(),
    term: z.string().min(1, 'Term is required for new items'),
    answer: z.string().min(1, 'Answer is required for new items'),
});

const itemSchema = z.union([updateItemSchema, newItemSchema]);

const updateFlashcard = z.object({
    body:z
    .object({
        title: z.string().optional(),
        visibility: z.enum(['ONLY_ME', 'EVERYONE']).optional(),
        items: z.array(itemSchema).optional(),
    })
    .refine(
        (data) =>
            data.title !== undefined ||
            data.visibility !== undefined ||
            (data.items && data.items.length > 0),
        {
            message: 'Nothing is provided to update',
        },
    )
})

const swipeFlashcardItemSchema = z.object({
    body: z.object({
        swipeDirection: z.enum(['right', 'left'], {
            message: 'Swipe direction must be "right" or "left"',
        }),
    }).strict(),
});



export const FlashcardValidation = { createFlashcard, updateFlashcard ,swipeFlashcardItemSchema};
