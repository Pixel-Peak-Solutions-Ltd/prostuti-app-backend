import { model, Schema } from 'mongoose';
import { FlashcardModel, IFlashcard } from './flashcard.interface';

const FlashcardSchema = new Schema<IFlashcard, FlashcardModel>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters long'],
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student ID is required'],
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
        },
    },
    {
        timestamps: true,
    },
);

// Indexes for performance
FlashcardSchema.index({ studentId: 1 });
FlashcardSchema.index({ title: 1 });

export const Flashcard = model<IFlashcard, FlashcardModel>(
    'Flashcard',
    FlashcardSchema,
);
