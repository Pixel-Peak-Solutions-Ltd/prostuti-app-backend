import { Model, Types } from "mongoose";

export type NotificationType = 'EditRequest' | 'CourseApproved' | 'General';

export interface INotification {
    recipient: Types.ObjectId;   // User receiving the notification
    sender: Types.ObjectId;      // User sending the notification
    type: NotificationType;
    title: string;
    message: string;
    resourceType?: string;       // Type of resource (Course, Assignment, etc.)
    resourceId?: Types.ObjectId; // ID of the resource
    isRead: boolean;
    metaData?: Record<string, any>; // Additional data
    createdAt: Date;
    updatedAt: Date;
}

export type NotificationModel = Model<INotification, Record<string, unknown>>;

export type INotificationFilters = {
    searchTerm?: string;
    recipient?: string;
    sender?: string;
    type?: string;
    isRead?: string;
    resourceType?: string;
}