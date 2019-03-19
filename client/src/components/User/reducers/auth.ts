import {
    AuthAction, LoginFailure, LoginRequest, LoginSuccess, LogoutSuccess
} from '../actions/user';
import { ILoginState } from '../types/user';

export default (
  state: ILoginState = {
    error: "",
    isFetching: false,
    username: "",
    isAdmin: false
  },
  action: AuthAction
) => {
  switch (action.type) {
    case LoginRequest:
      return {
        ...state,
        isFetching: true
      };
    case LoginSuccess:
      return {
        ...state,
        error: "",
        isFetching: false,
        username: action.username,
        isAdmin: action.isAdmin
      };
    case LoginFailure:
      return {
        ...state,
        error: action.message,
        isFetching: false
      };
    case LogoutSuccess:
      return {
        ...state,
        error: "",
        isFetching: false,
        username: "",
        isAdmin: false
      };
    default:
      return state;
  }
};
