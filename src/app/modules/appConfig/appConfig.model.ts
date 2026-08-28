import { Schema, model } from 'mongoose';
import { IAppConfig, AppConfigModel } from './appConfig.interface';

const AppConfigSchema = new Schema<IAppConfig, AppConfigModel>(
    {
        isTrialEnabled: {
            type: Boolean,
            required: true,
            default: false,
        },
        freeTrialDays: {
            type: Number,
            required: true,
            default: 7,
        },
        freeAccessFeatures: {
            type: [String],
            required: true,
            default: [],
        },
        featureLimits: {
            type: Schema.Types.Mixed,
            required: true,
            default: {},
        },
    },
    {
        timestamps: true,
    },
);

export const AppConfig = model<IAppConfig, AppConfigModel>(
    'AppConfig',
    AppConfigSchema,
);
