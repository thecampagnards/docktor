import { Dispatch } from 'redux';
import { IGroup } from '../types/model';
import { IStoreState } from '../types/store';
import { checkStatus } from '../utils/promises';
type FetchGroups = 'FETCH_GROUPS_REQUEST';
export const FetchGroups: FetchGroups = 'FETCH_GROUPS_REQUEST';
export interface IFetchGroups {
  type: FetchGroups;
}
type FetchGroupsSuccess = 'FETCH_GROUPS_SUCCESS';
export const FetchGroupsSuccess: FetchGroupsSuccess =
  'FETCH_GROUPS_SUCCESS';
export interface IFetchGroupsSuccess {
  type: FetchGroupsSuccess;
  groups: IGroup[];
}
type FetchGroupsFailure = 'FETCH_GROUPS_FAILURE';
export const FetchGroupsFailure: FetchGroupsFailure =
  'FETCH_GROUPS_FAILURE';
export interface IFetchGroupsFailure {
  type: FetchGroupsFailure;
  message: string;
}
export type GroupsAction =
  | IFetchGroups
  | IFetchGroupsSuccess
  | IFetchGroupsFailure;

export const fetchGroupsThunk = () => {
  return (dispatch: Dispatch<IStoreState>) => {
    dispatch({
      type: FetchGroups,
    });
    return fetch(
      `${process.env.PUBLIC_URL}/api/groups`,
      {
        credentials: 'same-origin',
        method: 'GET',
      },
    )
      .then(checkStatus)
      .then((response: Response) => response.json())
      .then((response: IGroup[]) => {
        dispatch({
          groups: response,
          type: FetchGroupsSuccess,
        });
      })
      .catch((error: Error) => {
        dispatch({
          message: error.message,
          type: FetchGroupsFailure,
        });
      });
  };
};
