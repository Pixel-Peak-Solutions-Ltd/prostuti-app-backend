export interface TResource {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}

export interface IAssignment {
    assignmentNo: string;
    marks: number;
    unlockDate: Date;
    deadline: Date;
    details: string;
    uploadFileResources: TResource[];
}
