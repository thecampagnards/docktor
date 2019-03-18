import * as JWT from 'jwt-decode';

import { checkStatus } from '../../../utils/promises';
import { IUser } from '../types/user';

export const IsAuthenticated = (): boolean => {
  return !!GetUsername();
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

export const SignIn = (user: IUser, ldap: boolean) => {
  return fetch(`${process.env.PUBLIC_URL}/auth/login?ldap=${ldap}`, {
    credentials: "same-origin",
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(checkStatus)
    .then((response: Response) => response.json())
    .then((token: string) => {
      localStorage.setItem("token", token);
      return GetUsername();
    });
};

export const SignOut = () => {
  localStorage.removeItem("token");
};

export const GetUsername = (): string | undefined => {
  const token = localStorage.getItem("token");
  if (token) {
    return (JWT(token) as IUser).Username;
  }
  return undefined;
};

export const GetToken = (): string | null => {
  return localStorage.getItem("token");
};
