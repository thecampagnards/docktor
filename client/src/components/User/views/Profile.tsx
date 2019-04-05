import * as React from 'react';
import { Loader, Message } from 'semantic-ui-react';

import { GetProfile } from '../actions/user';
import { IProfile } from '../types/user';
import ProfileCard from './ProfileCard';

interface IProfileStates {
  profile: IProfile;
  isFetching: boolean;
  error: Error;
}

class Profile extends React.Component<{}, IProfileStates> {
  public state = {
    profile: {} as IProfile,
    isFetching: true,
    error: Error()
  };

  public componentWillMount() {
    this.refreshUser();
  }

  public render() {
    const { profile, isFetching, error } = this.state;

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
        <ProfileCard user={profile} perm={profile.role === "admin"} refresh={this.refreshUser}/>
      </>
    );
  }

  private refreshUser = () => {
    GetProfile()
      .then(profile => this.setState({ profile, isFetching: false }))
      .catch(error => this.setState({ error, isFetching: false }));
  }
}

export default Profile;
