import { model, Schema } from 'mongoose';
import { FlashcardItemModel, IFlashcardItem } from './flashcardItem.interface';

const FlashcardItemSchema = new Schema<IFlashcardItem, FlashcardItemModel>(
  {
    flashcardId: {
      type: Schema.Types.ObjectId,
      ref: 'Flashcard',
      required: [true, 'Flashcard ID is required'],
    },
    term: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      minlength: [1, 'Question must be at least 1 character long'],
      
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      minlength: [1, 'Answer must be at least 1 character long'],
      
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative'],
    },
    favoritedBy: {
        type: [{
          type: Schema.Types.ObjectId,
          ref: 'Student', 
        }],
        required: [true, 'Favorited By array is required'],
        default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
FlashcardItemSchema.index({ flashcardId: 1 });
FlashcardItemSchema.index({ viewCount: -1 });

export const FlashcardItem = model<IFlashcardItem, FlashcardItemModel>('FlashcardItem', FlashcardItemSchema);