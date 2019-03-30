import { checkStatus } from '../../../utils/promises';
import { GetToken } from '../../User/actions/user';

export const fetchMesage = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/admin/config/message`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};
