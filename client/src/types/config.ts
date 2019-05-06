import { IMessage } from 'src/components/layout/types/layout';


export interface IConfigState {
    isFetching: boolean;
    error?: Error;
    config: IConfig;
}

export interface IConfig {
    message: IMessage;
    source: string;
}