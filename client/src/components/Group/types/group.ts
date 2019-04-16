import { IContainer } from '../../Daemon/types/daemon';

export interface IGroup {
  _id: string;
  name: string;
  description: string;
  daemon_id?: string;
  services: IServiceGroup[];
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
