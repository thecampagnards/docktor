import { checkStatus } from '../../../utils/promises';
import { GetToken } from './user';
import { userTypes } from '../types/user'

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
}

export const setGlobalRole = (username: string, role: userTypes) => {
    return fetch(`${process.env.PUBLIC_URL}/api/users/${username}/role/${role}`, {
      credentials: "same-origin",
      method: "PUT",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    })
      .then(checkStatus)
      .then((response: Response) => response.json());
  }