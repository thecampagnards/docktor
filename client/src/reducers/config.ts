import { IConfigState, IConfig } from '../types/config'
import { ConfigAction, ConfigRequest, ConfigSuccess, ConfigFailure } from '../actions/config';

export default (
    state: IConfigState = {
        isFetching: false,
        config: {} as IConfig,
      },
      action: ConfigAction
) => {
  switch (action.type) {
    case ConfigRequest:
      return {
        ...state,
        isFetching: true
      };
    case ConfigSuccess:
      return {
        ...state,
        error: Error(),
        isFetching: false,
        config: action.config
      };
    case ConfigFailure:
      return {
        ...state,
        error: action.error,
        isFetching: false
      };
    default:
      return state;
  }
};
