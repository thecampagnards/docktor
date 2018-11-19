import { IDaemon, ITodo, IGroup } from './model';

export interface ITodoState {
    isFetching: boolean;
    todo: ITodo | null;
}

export interface IGroupsState {
    isFetching: boolean;
    groups: IGroup[];
}

export interface IDaemonsState {
    isFetching: boolean;
    daemons: IDaemon[];
}

export interface IDaemonState {
    isFetching: boolean;
    daemon: IDaemon | null;
}

export interface IStoreState {
    daemons: IDaemonsState;
    daemon: IDaemonState;
    groups: IGroupsState;
    todo: ITodoState;
}
  