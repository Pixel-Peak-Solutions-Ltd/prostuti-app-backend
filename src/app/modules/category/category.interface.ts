import { Model } from "mongoose";
import { CategoryClass, CategoryDivision, CategoryType } from "./category.constant";

export type ICategory={
    type: CategoryType
    class?: CategoryClass
    division?: CategoryDivision
    subject: string; 
    universityType?: string; 
    universityName?: string; 
    unit?: string; 
  }


  export type CategoryModel = Model<
  ICategory,
  Record<string, unknown>
>;

export type ICategoryFilters = {
  searchTerm?: string;
  type?: string;
  class?: string;
  division?: string;
  subject?: string;
  universityType?: string;
  universityName?: string;
  unit?: string;
};
