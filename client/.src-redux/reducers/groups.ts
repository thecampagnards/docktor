import {
  FetchGroups,
  FetchGroupsFailure,
  FetchGroupsSuccess,
  GroupsAction
} from "../actions/groups";
import { IGroupsState } from "../types/store";
export default (
  state: IGroupsState = {
    isFetching: false,
    groups: []
  },
  action: GroupsAction
) => {
  switch (action.type) {
    case FetchGroups:
      return {
        ...state,
        isFetching: true
      };
    case FetchGroupsSuccess:
      return {
        ...state,
        isFetching: false,
        groups: action.groups
      };
    case FetchGroupsFailure:
      return {
        ...state,
        isFetching: false
      };
    default:
      return state;
  }
};
