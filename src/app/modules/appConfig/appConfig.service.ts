import { AppConfig } from './appConfig.model';
import { IAppConfig } from './appConfig.interface';

const getAppConfig = async () => {
    let config = await AppConfig.findOne();
    if (!config) {
        config = await AppConfig.create({});
    }
    return config;
};

const updateAppConfig = async (payload: Partial<IAppConfig>) => {
    let config = await AppConfig.findOne();
    if (!config) {
        config = await AppConfig.create(payload);
    } else {
        config = await AppConfig.findOneAndUpdate({}, payload, { new: true });
    }
    return config;
};

export const appConfigService = {
    getAppConfig,
    updateAppConfig,
};
