export interface IGroup {
    _id: string;
    Name: string;
    Description: string;
    DaemonID: string;
    Services: IServiceGroup[];
}

export interface IServiceGroup {
	ServiceID: string;
	Files: string;
}