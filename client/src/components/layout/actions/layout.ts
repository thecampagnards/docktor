import { checkStatus } from '../../../utils/promises';

export const fetchMesage = () => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/config/message`,
    {
      credentials: "same-origin",
      method: "GET"
    }
  )
    .then(checkStatus)
    .then((response: Response) => response.json());
};