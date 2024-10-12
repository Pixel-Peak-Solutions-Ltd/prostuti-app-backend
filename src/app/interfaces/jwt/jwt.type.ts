import { TUserRole } from '../../modules/user/user.interface';

export type TJWTDecodedUser = {
    email: string;
    role: TUserRole;
    iat: number;
};

export type TJWTPayload = {
    email: string;
    role: TUserRole;
};
