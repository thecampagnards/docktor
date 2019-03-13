import { IGroup } from 'src/components/Group/types/group';

export type userTypes = 'ADMIN' | 'USER';

export interface IUser {
	Username: string;
	Password: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Groups: IGroup[];
  Role: userTypes;
  exp: number;
}