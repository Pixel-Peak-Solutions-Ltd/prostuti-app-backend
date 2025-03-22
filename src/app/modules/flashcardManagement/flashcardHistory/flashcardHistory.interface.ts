import { Model, Types } from "mongoose";

export type ICardInteraction = {
    cardId: Types.ObjectId;
    isLearned: boolean;
  };
  export type IFlashcardHistory = {
    studentId: Types.ObjectId;
    flashcardId: Types.ObjectId;
    cardInteractions: ICardInteraction[]; 
  }

  export type FlashcardHistoryModel = Model<
  IFlashcardHistory,
  Record<string, unknown>
>;
export type IFlashcardHistoryFilters = {
    searchTerm?:string,
    studentId?: string; 
    flashcardId?: string; 
    cardId?: string; 
    isLearned?: string; 
  }