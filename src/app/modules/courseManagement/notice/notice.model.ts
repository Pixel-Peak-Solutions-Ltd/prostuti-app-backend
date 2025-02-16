import { Schema, model } from 'mongoose';
import { INotice } from './notice.interface';

const noticeSchema = new Schema<INotice>(
    {
        course_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
        notice: {
            type: String,
            required: [true, 'Notice is required'],
            minlength: [2, 'Notice must be at least 2 characters long'],
            maxlength: [500, 'Notice cannot be longer than 500 characters'],
        },
        // noticeId: {
        //     type: String,
        //     required: [true, 'Notice id is required'],
        // },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// noticeSchema.index({ course_id: 1, noticeId: 1, notice: 1 }, { unique: true });
noticeSchema.index({ course_id: 1, notice: 1 }, { unique: true });

export const Notice = model<INotice>('Notice', noticeSchema);
