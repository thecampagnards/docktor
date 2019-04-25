import { checkStatus } from '../../../utils/promises';
import { GetToken } from '../../User/actions/user';
import { ICommand } from '../types/images';

export const fetchCommands = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/commands`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const saveCommands = (commands: ICommand[]) => {
  return fetch(`${process.env.PUBLIC_URL}/api/commands`, {
    credentials: "same-origin",
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${GetToken()}`
    }),
    body: JSON.stringify(commands)
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};
