import { Types } from 'mongoose';

export interface INotice {
    course_id: Types.ObjectId;
    notice: string;
}

export type TCreateNoticePayload = {
    course_id: Types.ObjectId;
    notices: { noticeId: string; notice: string }[];
};
