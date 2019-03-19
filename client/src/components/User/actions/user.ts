import * as JWT from 'jwt-decode';
import { Dispatch } from 'redux';

import { checkStatus } from '../../../utils/promises';
import { IUser, IUserToken } from '../types/user';

type LoginRequest = "LOGIN_REQUEST";
export const LoginRequest: LoginRequest = "LOGIN_REQUEST";
export interface ILoginRequest {
  type: LoginRequest;
}

type LoginSuccess = "LOGIN_SUCCESS";
export const LoginSuccess: LoginSuccess = "LOGIN_SUCCESS";
export interface ILoginSuccess {
  type: LoginSuccess;
  username: string;
  isAdmin: boolean;
}

type LoginFailure = "LOGIN_FAILURE";
export const LoginFailure: LoginFailure = "LOGIN_FAILURE";
export interface ILoginFailure {
  type: LoginFailure;
  message: string;
}

type LogoutSuccess = "LOGOUT_SUCCESS";
export const LogoutSuccess: LogoutSuccess = "LOGOUT_SUCCESS";
export interface ILogoutSuccess {
  type: LogoutSuccess;
}

export type AuthAction =
  | ILoginRequest
  | ILoginSuccess
  | ILoginFailure
  | ILogoutSuccess;

export const loginRequestThunk = (u: IUser, ldap: boolean) => {
  return (dispatch: Dispatch<AuthAction>) => {
    dispatch({
      type: LoginRequest
    });
    return fetch(`${process.env.PUBLIC_URL}/api/auth/login?ldap=${ldap}`, {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify(u),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(checkStatus)
      .then((response: Response) => response.json())
      .then((token: string) => {
        localStorage.setItem("token", token);
        dispatch({
          type: LoginSuccess,
          username: (JWT(token) as IUserToken).Username,
          isAdmin: (JWT(token) as IUserToken).IsAdmin
        });
      })
      .catch((error: Error) => {
        dispatch({
          message: error.message,
          type: LoginFailure
        });
      });
  };
};

export const validateThunk = () => {
  return (dispatch: Dispatch<AuthAction>) => {
    const token = GetToken();
    if (token) {
      dispatch({
        type: LoginSuccess,
        username: (JWT(token) as IUserToken).Username,
        isAdmin: (JWT(token) as IUserToken).IsAdmin
      });
    }
  };
};

export const logoutRequestThunk = () => {
  return (dispatch: Dispatch<AuthAction>) => {
    localStorage.removeItem("token");
    dispatch({
      type: LogoutSuccess
    });
  };
};

export const GetToken = (): string | null => {
  return localStorage.getItem("token");
};

export const GetProfile = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/users/profile`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};
