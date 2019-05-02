import { IGroup } from '../../Group/types/group';

export type userTypes = "admin" | "user";

export interface ILoginState {
  isFetching: boolean;
  error: string;
  isAdmin: boolean;
  username: string | null;
}

export interface IUserToken {
  username: string;
  isAdmin: boolean;
  exp: number;
}

export interface IUser {
  username: string;
  password?: string;
  firstname: string;
  lastname: string;
  email: string;
  role: userTypes;
}

export interface IProfile extends IUser {
  groups: IGroup[];
}
