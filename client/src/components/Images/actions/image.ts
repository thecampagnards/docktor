import { checkStatus } from '../../../utils/promises';
import { GetToken } from '../../User/actions/user';
import { IImage } from '../types/image';

export const fetchImages = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/images`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const fetchImage = (image: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/images/${encodeURIComponent(image)}`,
    {
      credentials: "same-origin",
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    }
  )
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const saveImages = (commands: IImage[]) => {
  return fetch(`${process.env.PUBLIC_URL}/api/images`, {
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
