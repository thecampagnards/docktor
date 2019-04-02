import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import { IService } from '../../Services/types/service';
import { IUser } from '../../User/types/user';

export interface IGroup {
  _id: string;
  Name: string;
  Description: string;
  DaemonID: string;
  Services: IServiceGroup[];
  DaemonData: IDaemon;
  Users: string[];
  Admins: string[];
  Containers: IContainer[];

  UsersData: IUser[];
  AdminsData: IUser[];
}

export interface IServiceGroup {
  _id: string;
  SubService: IService;
  Variables: any;
}
