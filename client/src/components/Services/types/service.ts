export interface IService {
	_id: string;
	Name: string;
	Description: string;
	Image: string;
	SubServices: ISubServices[];
}

export interface ISubServices {
	_id: string;
	Name: string;
	File: string;
	Active: boolean;
	Variables: any;
}