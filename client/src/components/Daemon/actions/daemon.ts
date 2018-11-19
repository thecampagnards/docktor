import { checkStatus } from '../../../utils/promises';

export const fetchDaemons = () => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/daemons`,
    {
      credentials: 'same-origin',
      method: 'GET',
    },
  )
    .then(checkStatus)
    .then((response: Response) => response.json())

};

export const fetchDaemon = (daemonID: string) => {
    return fetch(
      `${process.env.PUBLIC_URL}/api/daemons/${daemonID}`,
      {
        credentials: 'same-origin',
        method: 'GET',
      },
    )
      .then(checkStatus)
      .then((response: Response) => response.json())

  };