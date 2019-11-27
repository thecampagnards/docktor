import { IMessage } from './types';

export interface IConfigState {
  isFetching: boolean;
  error?: Error;
  config: IConfig;
}

export interface IConfig {
  message: IMessage;
  doc_url: string;
  source: string;
  max_services: number;
}
