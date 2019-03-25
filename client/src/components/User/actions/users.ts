import { checkStatus } from '../../../utils/promises';
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
    return fetch(`${process.env.PUBLIC_URL}/api/daemons/${username}`, {
        credentials: "same-origin",
        method: "GET",
        headers: new Headers({
            Authorization: `Bearer ${GetToken()}`
        })
    })
        .then(checkStatus)
        .then(response => response.json());
};