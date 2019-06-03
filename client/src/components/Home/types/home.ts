import { IUser } from "src/components/User/types/user";
import { IGroup } from 'src/components/Group/types/group';
import { IDaemon, IMachineInfo, IContainer, IContainerInfo } from 'src/components/Daemon/types/daemon';

export interface IHomeData {
    user: IUser;
    environments: IEnvironment[];
}

export interface IEnvironment {
    group: IGroup;
    daemon: IDaemon;
    machine: IMachineInfo;
    resources: IContainerInfo;
    containers: IContainer[];
}