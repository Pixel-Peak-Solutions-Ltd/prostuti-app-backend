import { Model, Types } from 'mongoose';

export type IFlashcard = {
    title: string;
    studentId: Types.ObjectId;
    isApproved: boolean;
    approvedBy:Types.ObjectId

};
export type FlashcardModel = Model<
IFlashcard,
Record<string, unknown>
>;
export type IFlashcardFilters = {
    searchTerm?: string;
    title?: string;
    studentId?: string; 
    isApproved?: string;
  };