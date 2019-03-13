import auth from 'src/components/User/actions/user';
import { checkStatus } from 'src/utils/promises';

export const fetchAssets = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/admin/assets`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      'Authorization': `Bearer ${auth.getToken()}`
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
      'Authorization': `Bearer ${auth.getToken()}`
    }),
    body
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};