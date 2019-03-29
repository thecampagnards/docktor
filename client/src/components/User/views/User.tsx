import * as React from 'react';
import { Icon, Loader, Message, Button, Grid } from 'semantic-ui-react';

import { deleteUser, fetchUser, setGlobalRole } from '../actions/users';
import { IUser } from '../types/user';

import ProfileCard from './ProfileCard';
import { RouteComponentProps } from 'react-router-dom';
import { path } from '../../../constants/path'

interface IUserStates {
    user: IUser;
    isFetching: boolean;
    error: Error;
  }

  interface IRouterProps {
      userID: string;
  }

  class User extends React.Component<RouteComponentProps<IRouterProps>, IUserStates> {
    public state = {
      user: {} as IUser,
      isFetching: true,
      error: Error()
    };
    private userID = "";
  
    public componentWillMount() {
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
                <Button color="orange" icon={true} labelPosition='left' fluid={true}
                    onClick={this.logAsUser}>
                  <Icon name="user secret" /> Impersonate
                </Button>
              </Grid.Row>
              <Grid.Row>
                <Button color="red" icon={true} labelPosition='left' fluid={true}
                    onClick={this.deleteUser}>
                  <Icon name="user close" /> Remove user
                </Button>
              </Grid.Row>
              <Grid.Row>
                <Button color="green" icon={true} labelPosition='left' fluid={true}
                    onClick={this.setGlobalPermissions}>
                  <Icon name="user plus" /> Set admin
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
        .then(user => this.setState({ user, isFetching: false }))
        .catch(error => this.setState({ error, isFetching: false }));
    }

    private deleteUser = () => {
      deleteUser(this.userID)
        .then(() => this.props.history.push(path.users))
        .catch(error => this.setState({ error }));
    }

    private logAsUser = () => {
      console.log("Impersonate " + this.userID);
      // TODO
    }

    private setGlobalPermissions = () => {
      setGlobalRole(this.userID, "admin")
        .then(user => this.setState({ user }))
        .catch(error => this.setState({ error }));
    }
  }
  
  export default User;