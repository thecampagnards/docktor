export interface ITodo {
    name: string;
}

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

export interface IDaemon {
	_id: string;
	Name: string;
	Description: string;
	CAdvisor: string;
	Host: string;
	Port: number;
	Volume: string;
	Cert: string;
	Ca: string;
    Key: string;
}