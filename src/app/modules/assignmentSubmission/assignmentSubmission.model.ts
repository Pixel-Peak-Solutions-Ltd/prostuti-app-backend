import { Schema, model } from 'mongoose';
import {
    IAssignmentSubmission,
    TResource,
} from './assignmentSubmission.interface';
import { ASSIGNMENT_SUBMISSION_STATUS } from './assignmentSubmission.constant';

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

// Assignment Submission Schema
const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
    {
        course_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Course ID is required'],
            ref: 'Course',
            validate: {
                validator: async function (value: Schema.Types.ObjectId) {
                    const Course = model('Course');
                    const course = await Course.findById(value);
                    return course !== null;
                },
                message: 'Course does not exist',
            },
        },
        assignment_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Assignment ID is required'],
            ref: 'Assignment',
            validate: {
                validator: async function (value: Schema.Types.ObjectId) {
                    const Assignment = model('Assignment');
                    const assignment = await Assignment.findById(value);
                    return assignment !== null;
                },
                message: 'Assignment does not exist',
            },
        },
        studentProfile_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Student Profile ID is required'],
            ref: 'Student',
        },
        status: {
            type: String,
            required: [true, 'Status is required'],
            enum: {
                values: Object.values(ASSIGNMENT_SUBMISSION_STATUS),
                message: '{VALUE} is not a valid status',
            },
            index: true,
        },
        submissionDate: {
            type: Date,
            required: [true, 'Submission date is required'],
            validate: {
                validator: function (value: Date) {
                    return value <= new Date();
                },
                message: 'Submission date cannot be in the future',
            },
            index: true,
        },
        uploadFileResource: {
            type: resourceSchema,
            required: [true, 'Upload file resource is required'],
        },
        givenMark: {
            type: String,
            validate: {
                validator: function (value: string) {
                    const isNumeric = /^\d+$/.test(value);
                    const num = parseInt(value, 10);
                    return isNumeric && num >= 0;
                },
                message: 'Given mark must be a non-negative number',
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.id;
                return ret;
            },
        },
        toObject: { virtuals: true },
    },
);

// Indexes for optimizing queries
assignmentSubmissionSchema.index({ course_id: 1, assignment_id: 1 });
assignmentSubmissionSchema.index(
    { studentProfile_id: 1, assignment_id: 1 },
    { unique: true },
);
assignmentSubmissionSchema.index({ submissionDate: -1 });

// Middleware to check if assignment is still open before saving
assignmentSubmissionSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('submissionDate')) {
        const Assignment = model('Assignment');
        const assignment = await Assignment.findById(this.assignment_id);

        if (!assignment) {
            return next(new Error('Assignment not found'));
        }

        if (
            assignment.deadline &&
            new Date(assignment.deadline) < this.submissionDate
        ) {
            return next(new Error('Cannot submit after assignment deadline'));
        }
    }
    next();
});

// Virtual for calculating submission time relative to deadline
assignmentSubmissionSchema.virtual('isLate').get(async function () {
    const Assignment = model('Assignment');
    const assignment = await Assignment.findById(this.assignment_id);
    if (assignment?.deadline) {
        return this.submissionDate > new Date(assignment.deadline);
    }
    return false;
});

// Create and export the model
export const AssignmentSubmission = model<IAssignmentSubmission>(
    'AssignmentSubmission',
    assignmentSubmissionSchema,
);
