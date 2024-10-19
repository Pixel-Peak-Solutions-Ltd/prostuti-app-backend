import { TUserRole } from '../../modules/user/user.interface';

export type TJWTDecodedUser = {
    registeredId: string;
    email: string;
    role: TUserRole;
    iat: number;
};

export type TJWTPayload = {
    registeredId: string;
    email?: string;
    role: TUserRole;
};
