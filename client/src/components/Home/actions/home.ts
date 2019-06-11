import { GetToken } from '../../User/actions/user';
import { checkStatus } from '../../../utils/promises';

export const fetchHome = () => {
    return fetch(`${process.env.PUBLIC_URL}/api/home`, {
      credentials: "same-origin",
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    })
      .then(checkStatus)
      .then((response: Response) => response.json());
  };
  