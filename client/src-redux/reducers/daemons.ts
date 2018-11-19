import {
  FetchDaemons,
  FetchDaemonsFailure,
  FetchDaemonsSuccess,
  DaemonsAction
} from "../actions/daemons";
import { IDaemonsState } from "../types/store";
export default (
  state: IDaemonsState = {
    isFetching: false,
    daemons: []
  },
  action: DaemonsAction
) => {
  switch (action.type) {
    case FetchDaemons:
      return {
        ...state,
        isFetching: true
      };
    case FetchDaemonsSuccess:
      return {
        ...state,
        isFetching: false,
        daemons: action.daemons
      };
    case FetchDaemonsFailure:
      return {
        ...state,
        isFetching: false
      };
    default:
      return state;
  }
};
