import { IMessage } from './types';

export interface IConfigState {
  isFetching: boolean;
  error?: Error;
  config: IConfig;
}

export interface IConfig {
  message: IMessage;
  source: string;
}
