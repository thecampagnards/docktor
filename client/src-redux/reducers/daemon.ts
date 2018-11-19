import {
  FetchDaemon,
  FetchDaemonFailure,
  FetchDaemonSuccess,
  DaemonAction
} from "../actions/daemon";
import { IDaemonState } from "../types/store";
export default (
  state: IDaemonState = {
    isFetching: false,
    daemon: null
  },
  action: DaemonAction
) => {
  switch (action.type) {
    case FetchDaemon:
      return {
        ...state,
        isFetching: true
      };
    case FetchDaemonSuccess:
      return {
        ...state,
        isFetching: false,
        daemon: action.daemon
      };
    case FetchDaemonFailure:
      return {
        ...state,
        isFetching: false
      };
    default:
      return state;
  }
};
