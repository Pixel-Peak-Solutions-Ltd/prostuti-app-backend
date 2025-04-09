import { model, Schema } from 'mongoose';
import {
    FlashcardHistoryModel,
    ICardInteraction,
    IFlashcardHistory,
} from './flashcardHistory.interface';

const CardInteractionSchema = new Schema<ICardInteraction>({
    cardId: {
        type: Schema.Types.ObjectId,
        ref: 'FlashcardItem',
        required: [true, 'Card ID is required'],
    },
    isLearned: {
        type: Boolean,
        required: [true, 'Learned status is required'],
        default: false,
    },
    isKnown: {
        type: Boolean,
        required: [true, 'Known status is required'],
        default: false,
    },
});

const FlashcardHistorySchema = new Schema<
    IFlashcardHistory,
    FlashcardHistoryModel
>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student ID is required'],
        },
        flashcardId: {
            type: Schema.Types.ObjectId,
            ref: 'Flashcard',
            required: [true, 'Flashcard ID is required'],
        },
        cardInteractions: {
            type: [CardInteractionSchema],
            default: [],
            validate: {
                validator: (arr: ICardInteraction[]) => {
                    const cardIds = arr.map((ci) => ci.cardId.toString());
                    return cardIds.length === new Set(cardIds).size;
                },
                message:
                    'Card interactions must not contain duplicate card IDs',
            },
        },
    },
    {
        timestamps: true,
    },
);

FlashcardHistorySchema.index(
    { studentId: 1, flashcardId: 1 },
    { unique: true },
);
FlashcardHistorySchema.index({ 'cardInteractions.cardId': 1 });

export const FlashcardHistory = model<IFlashcardHistory, FlashcardHistoryModel>(
    'FlashcardHistory',
    FlashcardHistorySchema,
);
