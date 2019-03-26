import * as React from 'react';
import { Loader, Message } from 'semantic-ui-react';

import { GetProfile } from '../actions/user';
import { IUser } from '../types/user';

import ProfileCard from './ProfileCard';

interface IProfileStates {
  user: IUser;
  isFetching: boolean;
  error: Error;
}

class Profile extends React.Component<{}, IProfileStates> {
  public state = {
    user: {} as IUser,
    isFetching: true,
    error: Error()
  };

  public componentWillMount() {
    this.refreshUser = this.refreshUser.bind(this);
    this.refreshUser();
  }

  public render() {
    const { user, isFetching, error } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>Failed to load profile with error :</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <>
        <ProfileCard user={user} perm={user.Role === "admin"} refresh={this.refreshUser}/>
      </>
    );
  }

  private refreshUser(){
    GetProfile()
      .then(user => this.setState({ user, isFetching: false }))
      .catch(error => this.setState({ error, isFetching: false }));
  }
}

export default Profile;
