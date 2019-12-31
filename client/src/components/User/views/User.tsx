import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Grid, Icon, Loader, Message } from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { deleteUser, fetchUser, saveUser } from '../actions/users';
import { IProfile } from '../types/user';
import ProfileCard from './ProfileCard';

interface IUserStates {
  user: IProfile;
  isFetching: boolean;
  error: Error;
}

interface IRouterProps {
  userID: string;
}

class User extends React.Component<
  RouteComponentProps<IRouterProps>,
  IUserStates
> {
  public state = {
    user: {} as IProfile,
    isFetching: true,
    error: Error()
  };
  private userID = "";

  public componentDidMount() {
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
        <ProfileCard user={user} perm={true} refresh={this.refreshUser} />
        <Grid>
          <Grid.Column width={7} />
          <Grid.Column textAlign="center" width={2}>
            <Grid.Row>
              <Button
                color="orange"
                icon={true}
                labelPosition="left"
                fluid={true}
                onClick={this.logAsUser}
              >
                <Icon name="user secret" /> Impersonate
              </Button>
            </Grid.Row>
            <Grid.Row>
              <Button
                color="red"
                icon={true}
                labelPosition="left"
                fluid={true}
                onClick={this.deleteUser}
              >
                <Icon name="user close" /> Remove user
              </Button>
            </Grid.Row>
            <Grid.Row>
              <Button
                color="green"
                icon={true}
                labelPosition="left"
                fluid={true}
                onClick={this.setGlobalPermissions}
              >
                <Icon name="user plus" /> Set{" "}
                {user.role === "admin" ? "user" : "admin"}
              </Button>
            </Grid.Row>
          </Grid.Column>
          <Grid.Column width={7} />
        </Grid>
      </>
    );
  }

  private refreshUser = () => {
    const { userID } = this.props.match.params;
    this.userID = userID;
    fetchUser(userID)
      .then(user => this.setState({ user }))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };

  private deleteUser = () => {
    deleteUser(this.userID)
      .then(() => this.props.history.push(path.users))
      .catch(error => this.setState({ error }));
  };

  private logAsUser = () => {
    console.log("Impersonate " + this.userID);
    // TODO
  };

  private setGlobalPermissions = () => {
    const { user } = this.state;
    user.role = user.role === "admin" ? "user" : "admin";
    this.setState({ isFetching: true });
    saveUser(user)
      .then(u => this.setState({ user: u }))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };
}

export default User;
