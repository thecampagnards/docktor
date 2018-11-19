import { Dispatch } from 'redux';
import { IDaemon } from '../types/model';
import { IStoreState } from '../types/store';
import { checkStatus } from '../utils/promises';
type FetchDaemon = 'FETCH_DAEMON_REQUEST';
export const FetchDaemon: FetchDaemon = 'FETCH_DAEMON_REQUEST';
export interface IFetchDaemon {
  type: FetchDaemon;
}
type FetchDaemonSuccess = 'FETCH_DAEMON_SUCCESS';
export const FetchDaemonSuccess: FetchDaemonSuccess =
  'FETCH_DAEMON_SUCCESS';
export interface IFetchDaemonSuccess {
  type: FetchDaemonSuccess;
  daemon: IDaemon;
}
type FetchDaemonFailure = 'FETCH_DAEMON_FAILURE';
export const FetchDaemonFailure: FetchDaemonFailure =
  'FETCH_DAEMON_FAILURE';
export interface IFetchDaemonFailure {
  type: FetchDaemonFailure;
  message: string;
}
export type DaemonAction =
  | IFetchDaemon
  | IFetchDaemonSuccess
  | IFetchDaemonFailure;

export const fetchDaemonThunk = (daemonID: string) => {
  return (dispatch: Dispatch<IStoreState>) => {
    dispatch({
      type: FetchDaemon,
    });
    return fetch(
      `${process.env.PUBLIC_URL}/api/daemons/${daemonID}`,
      {
        credentials: 'same-origin',
        method: 'GET',
      },
    )
      .then(checkStatus)
      .then((response: Response) => response.json())
      .then((response: IDaemon) => {
        dispatch({
          daemon: response,
          type: FetchDaemonSuccess,
        });
      })
      .catch((error: Error) => {
        dispatch({
          message: error.message,
          type: FetchDaemonFailure,
        });
      });
  };
};
