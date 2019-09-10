import {
    AuthAction, LoginFailure, LoginSuccess, LogoutSuccess, RegisterFailure, RegisterRequest,
    RegisterSuccess,
    RegisterSuccessLogin
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
    case LoginSuccess:
      return {
        ...state,
        error: "",
        isFetching: false,
        username: action.username,
        isAdmin: action.isAdmin
      };
    case RegisterFailure:
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
    case RegisterRequest:
      return {
        ...state,
        isFetching: true
      };
    case RegisterSuccess:
      return {
        ...state,
        error: "",
        isFetching: false
      }
    case RegisterSuccessLogin:
      return {
        ...state,
        error: "",
        isFetching: false,
        username: action.username,
        isAdmin: false
      };
    default:
      return state;
  }
};
