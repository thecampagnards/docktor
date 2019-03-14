import { IDaemon } from '../../Daemon/types/daemon';
import { IService } from '../../Services/types/service';

export interface IGroup {
  _id: string;
  Name: string;
  Description: string;
  DaemonID: string;
  Daemon: IDaemon;
  Services: IServiceGroup[];
}

export interface IServiceGroup {
  _id: string;
  SubService: IService;
  Variables: any;
}
