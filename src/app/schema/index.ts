import { Schema } from "mongoose";
import { TImage } from "../interfaces/common";

export const imageSchema = new Schema<TImage>(
    {
        diskType: {
            type: String,
            required: [true, 'Image disk type is required'],
        },
        path: {
            type: String,
            required: [true, 'Image url is required'],
        },
        originalName: {
            type: String,
            required: [true, 'Image original name is required'],
        },
        modifiedName: {
            type: String,
            required: [true, 'Image modified name is required'],
        },
        fileId: {
            type: String,
            required: [true, 'File ID is required'],
        },
    },
    { _id: false, versionKey: false },
);