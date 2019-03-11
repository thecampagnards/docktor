import { checkStatus } from 'src/utils/promises';
import { IUser } from '../types/user';

class Auth {

  private user: IUser

  constructor() {
    this.isAuthenticated.bind(this)
    this.signIn.bind(this)
    this.signOut.bind(this)
  }

  public isAuthenticated = (): boolean => {
    return !!this.user.Username
  }

  public signIn = (user: IUser) => {
    return fetch(`${process.env.PUBLIC_URL}/api/user`, {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(checkStatus)
      .then((response: Response) => response.json())
  }

  public signOut = () => {
    this.user = {} as IUser
  }

  public getUser = (): IUser => {
    return this.user
  }
}

const auth = new Auth();

export default auth;