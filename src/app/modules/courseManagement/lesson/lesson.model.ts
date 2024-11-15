import { Schema, model } from 'mongoose';
import { ILesson } from './lesson.interface';

// Lesson Schema
const lessonSchema = new Schema<ILesson>(
    {
        number: {
            type: String,
            required: true,
            validate: {
                validator: (value) => /^Lesson \d+$/.test(value),
                message:
                    'Lesson number must be in the format "Lesson 1", "Lesson 2", etc.',
            },
        },
        name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 100,
        },
        course_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Create and export the model
export const Lesson = model<ILesson>('Lesson', lessonSchema);
