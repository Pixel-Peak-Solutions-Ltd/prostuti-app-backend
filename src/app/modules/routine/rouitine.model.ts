import { Schema, model } from 'mongoose';
import { IRoutine, RoutineModel } from './routine.interface';
import { RoutineTypes } from './routine.constant';

const RoutineSchema = new Schema<IRoutine, RoutineModel>(
    {
        type: {
            type: String,
            enum: RoutineTypes,
            required: [true, 'Routine type is required.'],
        },
        date: {
            type: Date,
            required: [true, 'Routine date is required.'],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            default: function () {
                return this.createdBy;
            },
        },
    },
    {
        timestamps: true,
    },
);

export const Routine = model<IRoutine, RoutineModel>('Routine', RoutineSchema);
