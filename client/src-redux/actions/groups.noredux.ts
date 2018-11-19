import { checkStatus } from '../utils/promises';

export const fetchGroup = (groupID: string) => {
    return fetch(
      `${process.env.PUBLIC_URL}/api/groups/${groupID}`,
      {
        credentials: 'same-origin',
        method: 'GET',
      },
    )
      .then(checkStatus)
      .then((response: Response) => response.json())
  };
