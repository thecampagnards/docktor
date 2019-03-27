import * as React from 'react';
import { Loader, Message } from 'semantic-ui-react';

import { fetchUser } from '../actions/users';
import { IUser } from '../types/user';

import ProfileCard from './ProfileCard';
import { RouteComponentProps } from 'react-router-dom';

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
  
    public componentWillMount() {
      const { userID } = this.props.match.params
      fetchUser(userID)
        .then(user => this.setState({ user, isFetching: false }))
        .catch(error => this.setState({ error, isFetching: false }));
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
  
      return <ProfileCard user={user} perm={true} />;
    }
  }
  
  export default User;