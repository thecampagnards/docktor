export interface IService {
	_id: string;
	Name: string;
	Image: string;
	ServiceFiles: IServiceFile[];
}

export interface IServiceFile {
	File: string;
	Active: boolean;
	Variables: string[];
}