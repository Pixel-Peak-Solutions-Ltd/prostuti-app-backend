export type TGender = 'male' | 'female' | 'others';

export interface IStudent {
    name: string;
    gender: TGender;
    dateOfBirth?: string;
    email: string;
    contactNo: string;
}
