import { GetToken } from '../components/User/actions/user';
import { checkStatus } from '../utils/promises';

export const fetchMesage = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/config/message`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};
