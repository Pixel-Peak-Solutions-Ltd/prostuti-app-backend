
import { Model, Types } from 'mongoose';


export type IFlashcardItem = {
  flashcardId: Types.ObjectId;
  term: string;
  answer: string;
  viewCount: number;
  favoritedBy:Types.ObjectId[];
} 


export type FlashcardItemModel = Model<
  IFlashcardItem,
  Record<string, unknown>
>;


export type IFlashcardItemFilters = {
  searchTerm?: string; 
  flashcardId?: string; 
  question?: string;
  answer?: string;
  viewCount?: number;
  favoritedBy?: string; 
};