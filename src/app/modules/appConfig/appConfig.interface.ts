import { Model } from 'mongoose';

export type IAppConfig = {
    isTrialEnabled: boolean;
    freeTrialDays: number;
    freeAccessFeatures: string[];
    featureLimits: Record<string, number>;
};

export type AppConfigModel = Model<IAppConfig, Record<string, unknown>>;
