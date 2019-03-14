import createHistory from 'history/createBrowserHistory';
import * as HttpStatus from 'http-status-codes';

import { path } from '../constants/path';

const history = createHistory()

export function checkStatus(response: Response) {
  if (response.status === HttpStatus.UNAUTHORIZED) {
    history.push(path.login)
  }
  if (response.ok) {
    return Promise.resolve(response);
  }
  return response
    .text()
    .then(text =>
      Promise.reject(new Error(text || response.statusText)),
    );
}
