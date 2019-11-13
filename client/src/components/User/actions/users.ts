import { checkStatus } from '../../../utils/promises';
import { IUser } from '../types/user';
import { GetToken } from './user';

export const fetchUsers = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/users`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then(response => response.json());
};

export const fetchUser = (username: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/users/${username}`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then(response => response.json());
};

export const deleteUser = (username: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/users/${username}`, {
    credentials: "same-origin",
    method: "DELETE",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then(response => response.json());
};

export const saveUser = (user: IUser) => {
  return fetch(`${process.env.PUBLIC_URL}/api/users`, {
    credentials: "same-origin",
    method: "POST",
    body: JSON.stringify(user),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};
