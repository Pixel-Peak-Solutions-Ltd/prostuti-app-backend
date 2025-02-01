export type IPaginationOptions = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
};
export interface TImage {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}
