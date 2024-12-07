import { Schema, model } from 'mongoose';
import { IAssignment, TResource } from './assignment.interface';

// Resource Schema
const resourceSchema = new Schema<TResource>(
    {
        diskType: {
            type: String,
            required: [true, 'Disk type is required'],
            trim: true,
        },
        path: {
            type: String,
            required: [true, 'Path is required'],
            trim: true,
        },
        originalName: {
            type: String,
            required: [true, 'Original name is required'],
            trim: true,
        },
        modifiedName: {
            type: String,
            required: [true, 'Modified name is required'],
            trim: true,
        },
        fileId: {
            type: String,
            required: [true, 'File ID is required'],
            trim: true,
        },
    },
    { _id: false, versionKey: false },
);

// Assignment Schema
const assignmentSchema = new Schema<IAssignment>(
    {
        course_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
        lesson_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Lesson',
        },
        assignmentNo: {
            type: String,
            required: [true, 'Assignment number is required'],
            unique: true,
            trim: true,
        },
        marks: {
            type: Number,
            required: [true, 'Marks are required'],
            min: [0, 'Marks cannot be negative'],
            validate: {
                validator: Number.isInteger,
                message: 'Marks must be a whole number',
            },
        },
        unlockDate: {
            type: Date,
            required: [true, 'Unlock date is required'],
            validate: {
                validator: function (value: Date) {
                    return value instanceof Date && !isNaN(value.getTime());
                },
                message: 'Invalid unlock date',
            },
        },
        details: {
            type: String,
            required: [true, 'Details are required'],
            trim: true,
            minlength: [1, 'Details cannot be empty'],
        },
        uploadFileResources: {
            type: [resourceSchema],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

assignmentSchema.index({ course_id: 1, lesson_id: 1, assignmentNo: 1 }, { unique: true });

// Create and export the model
export const Assignment = model<IAssignment>('Assignment', assignmentSchema);
