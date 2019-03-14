import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import auth from '../actions/user';
import { IUser } from '../types/user';

class Profile extends React.Component<RouteComponentProps> {

  private user : IUser

  public componentWillMount(){
    const user = auth.getUser()
    if (user) {
      this.user = user
    }
  }

  public render() {
    return (
      <pre>
        {JSON.stringify(this.user)}
      </pre>
    )
  }
}

export default Profile
