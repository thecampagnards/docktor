import { IGroup } from 'src/components/Group/types/group';

export type userTypes = "admin" | "user";

export interface ILoginState {
  isFetching: boolean;
  error: string;
  isAdmin: boolean;
  username: string | null;
}

export interface IUserToken {
  Username: string;
  IsAdmin: boolean;
  exp: number;
}

export interface IUser {
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Groups: IGroup[];
  Role: userTypes;
}
