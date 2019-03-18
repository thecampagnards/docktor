import { IGroup } from 'src/components/Group/types/group';

export type userTypes = "admin" | "user";

export interface IUser {
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Groups: IGroup[];
  Role: userTypes;
}
