import { IUser } from "src/components/User/types/user";
import { IGroup } from 'src/components/Group/types/group';
import { IDaemon, IMachineInfo, IContainer } from 'src/components/Daemon/types/daemon';

export interface IHomeData {
    user: IUser;
    environments: IEnvironment[];
}

export interface IEnvironment {
    group: IGroup;
    daemon: IDaemon;
    machine: IMachineInfo;
    containers: IContainer[];
}