import { Dispatch } from 'react';
import { IConfig } from 'src/types/config';

import { GetToken } from '../components/User/actions/user';
import { checkStatus } from '../utils/promises';

type ConfigRequest = "CONFIG_REQUEST";
export const ConfigRequest: ConfigRequest = "CONFIG_REQUEST";
export interface IConfigRequest {
  type: ConfigRequest;
}

type ConfigSuccess = "CONFIG_SUCCESS";
export const ConfigSuccess: ConfigSuccess = "CONFIG_SUCCESS";
export interface IConfigSuccess {
  type: ConfigSuccess;
  config: IConfig;
}

type ConfigFailure = "CONFIG_FAILURE";
export const ConfigFailure: ConfigFailure = "CONFIG_FAILURE";
export interface IConfigFailure {
  type: ConfigFailure;
  error: Error;
}

export type ConfigAction = IConfigRequest | IConfigSuccess | IConfigFailure;

export const fetchConfig = () => {
  return (dispatch: Dispatch<ConfigAction>) => {
    dispatch({
      type: ConfigRequest
    });
    return fetch(`${process.env.PUBLIC_URL}/api/admin/config`, {
      credentials: "same-origin",
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    })
      .then(checkStatus)
      .then((response: Response) => response.json())
      .then((config: IConfig) => {
        dispatch({
          type: ConfigSuccess,
          config
        });
      })
      .catch((error: Error) => {
        dispatch({
          error,
          type: ConfigFailure
        });
      });
  };
};
