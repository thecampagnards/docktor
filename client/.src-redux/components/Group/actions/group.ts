import { checkStatus } from '../../../utils/promises';

export const fetchGroups = () => {
    return fetch(
      `${process.env.PUBLIC_URL}/api/groups`,
      {
        credentials: 'same-origin',
        method: 'GET',
      },
    )
      .then(checkStatus)
      .then((response: Response) => response.json())
  };


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
