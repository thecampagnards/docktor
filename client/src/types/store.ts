import { ILoginState } from '../components/User/types/user';
import { IConfigState } from './config';

export interface IStoreState {
  login: ILoginState;
  config: IConfigState;
}
