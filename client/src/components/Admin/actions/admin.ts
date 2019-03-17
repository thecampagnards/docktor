import { checkStatus } from '../../../utils/promises';
import { GetToken } from '../../User/actions/user';

export const fetchAssets = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/admin/assets`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const saveAsset = (name: string, body: any) => {
  return fetch(`${process.env.PUBLIC_URL}/api/admin/assets/${name}`, {
    credentials: "same-origin",
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    }),
    body
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};
