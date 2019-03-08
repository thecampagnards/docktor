import { checkStatus } from 'src/utils/promises';

export const fetchAssets = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/admin/assets`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const saveAsset = (name: string, body: any) => {
  return fetch(`${process.env.PUBLIC_URL}/api/admin/assets/${name}`, {
    credentials: "same-origin",
    method: "POST",
    body
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};