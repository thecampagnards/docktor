import { IContainer } from '../../Daemon/types/daemon';
import { IGroupService } from '../../Services/types/service';

export interface IGroup {
  _id: string;
  name: string;
  description: string;
  daemon_id?: string;
  services: IGroupService[];
  users: string[];
  admins: string[];

  containers: IContainer[];
  min_port: string;
  max_port: string;
  subnet: string;
}

export interface IServiceGroup {
  _id: string;
  variables?: any;
  auto_update: boolean;
  ports: number[];
}

export interface IServiceStatus {
  containers_status: IContainerStatus[];
}

export interface IContainerStatus {
  name: string;
  state: string;
}