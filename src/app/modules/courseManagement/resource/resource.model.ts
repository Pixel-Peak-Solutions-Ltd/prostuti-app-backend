import { Schema, model } from 'mongoose';
import { IResources, TResource } from './resource.interface';

// Resource Schema Type Definition
const resourceSchema = new Schema<TResource>(
    {
        diskType: {
            type: String,
            required: [true, 'Image disk type is required'],
        },
        path: {
            type: String,
            required: [true, 'Path is required'],
        },
        originalName: {
            type: String,
            required: [true, 'Original name is required'],
        },
        modifiedName: {
            type: String,
            required: [true, 'Modified name is required'],
        },
        fileId: {
            type: String,
            required: [true, 'File ID is required'],
        },
    },
    { _id: false, versionKey: false },
);

// Resources Schema Definition
const resourcesSchema = new Schema<IResources>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot be more than 100 characters'],
            minlength: [2, 'Name must be at least 2 characters long'],
        },
        resourceDate: {
            type: Date,
            required: [true, 'Date is required'],
            validate: {
                validator: function (value: Date) {
                    return value instanceof Date && !isNaN(value.getTime());
                },
                message: 'Invalid date format',
            },
        },
        uploadFileResources: [resourceSchema],
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Create and export the model
export const Resource = model<IResources>('Resource', resourcesSchema);
