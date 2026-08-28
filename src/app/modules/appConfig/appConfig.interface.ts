import { Model } from 'mongoose';

export type IAppConfig = {
    isTrialEnabled: boolean;
    freeTrialDays: number;
    freeAccessFeatures: string[];
    featureLimits: Record<string, number>;
    supportMobileNumber: string;
};

export type AppConfigModel = Model<IAppConfig, Record<string, unknown>>;
