import { IUser } from "../../User/types/user";
import { IGroup } from '../../Group/types/group';
import { IDaemon, IContainer } from '../../Daemon/types/daemon';

export interface IHomeData {
    user: IUser;
    environments: IEnvironment[];
}

export interface IEnvironment {
    group: IGroup;
    daemon: IDaemon;
    resources: IResources;
    containers: IContainer[];
}

export interface IResources {
    cpu: number;
    ram: number;
    fs: IFileSystem[];
}

export interface IFileSystem {
    device: string;
    capacity: number;
    usage: number;
}