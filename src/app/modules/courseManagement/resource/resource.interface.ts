export interface TResource {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}

export interface IResources {
    name: string;
    resourceDate: Date;
    uploadFileResources: TResource[];
}
