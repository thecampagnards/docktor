import { Dispatch } from 'redux';
import { IDaemon } from '../types/model';
import { IStoreState } from '../types/store';
import { checkStatus } from '../utils/promises';
type FetchDaemons = 'FETCH_DAEMONS_REQUEST';
export const FetchDaemons: FetchDaemons = 'FETCH_DAEMONS_REQUEST';
export interface IFetchDaemons {
  type: FetchDaemons;
}
type FetchDaemonsSuccess = 'FETCH_DAEMONS_SUCCESS';
export const FetchDaemonsSuccess: FetchDaemonsSuccess =
  'FETCH_DAEMONS_SUCCESS';
export interface IFetchDaemonsSuccess {
  type: FetchDaemonsSuccess;
  daemons: IDaemon[];
}
type FetchDaemonsFailure = 'FETCH_DAEMONS_FAILURE';
export const FetchDaemonsFailure: FetchDaemonsFailure =
  'FETCH_DAEMONS_FAILURE';
export interface IFetchDaemonsFailure {
  type: FetchDaemonsFailure;
  message: string;
}
export type DaemonsAction =
  | IFetchDaemons
  | IFetchDaemonsSuccess
  | IFetchDaemonsFailure;

export const fetchDaemonsThunk = () => {
  return (dispatch: Dispatch<IStoreState>) => {
    dispatch({
      type: FetchDaemons,
    });
    return fetch(
      `${process.env.PUBLIC_URL}/api/daemons`,
      {
        credentials: 'same-origin',
        method: 'GET',
      },
    )
      .then(checkStatus)
      .then((response: Response) => response.json())
      .then((response: IDaemon[]) => {
        dispatch({
          daemons: response,
          type: FetchDaemonsSuccess,
        });
      })
      .catch((error: Error) => {
        dispatch({
          message: error.message,
          type: FetchDaemonsFailure,
        });
      });
  };
};
