import * as JWT from 'jwt-decode';

import { checkStatus } from '../../../utils/promises';
import { IUser } from '../types/user';

class Auth {

  constructor() {
    this.isAuthenticated.bind(this)
    this.signIn.bind(this)
    this.signOut.bind(this)
  }

  public isAuthenticated = (): boolean => {
    return !!this.getUser()
  }

  public signIn = (user: IUser, ldap: boolean) => {
    return fetch(`${process.env.PUBLIC_URL}/api/users/login?ldap=${ldap}`, {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(checkStatus)
      .then((response: Response) => response.json())
      .then((token: string) => {
        localStorage.setItem('token', JSON.stringify(token))
        return JWT(token) as IUser
      })
  }

  public signOut = () => {
    localStorage.removeItem('token')
  }

  public getUser = (): IUser | undefined => {
    const token = localStorage.getItem('token')
    if (token) {
      return JWT(token)
    }
    return undefined
  }

  public getToken = ():string | null => {
    return localStorage.getItem('token')
  }
}

const auth = new Auth();

export default auth;