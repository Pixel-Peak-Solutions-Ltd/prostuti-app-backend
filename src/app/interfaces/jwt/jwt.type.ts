import { TUserRole } from '../../modules/user/user.interface';

export type TJWTDecodedUser = {
    userId?: string;
    email: string;
    role: TUserRole;
    iat: number;
};

export type TJWTPayload = {
    userId?: string;
    email?: string;
    role: TUserRole;
};
