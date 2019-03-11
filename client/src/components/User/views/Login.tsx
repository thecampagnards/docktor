import * as React from "react";

import Layout from 'src/components/layout/layout';
import { Form, Button, Message } from 'semantic-ui-react';

import { IUser } from '../types/user';
import { path } from '../../../constants/path';
import { RouteComponentProps } from 'react-router-dom';
import auth from '../actions/user';

interface ILoginStates {
  isFetching: boolean;
  isSuccess: boolean;
  error: Error | null;

  user: IUser;
}

class Login extends React.Component<RouteComponentProps, ILoginStates> {

  public state = {
    isFetching: false,
    isSuccess: false,
    error: null,

    user: {} as IUser
  };

  public render() {

    const { isSuccess, isFetching, error } = this.state

    return (
      <Layout>
        <h2>Login</h2>
        <Form success={isSuccess} error={error !== null} onSubmit={this.submit} loading={isFetching}>
          <Form.Input fluid={true} label='Username' placeholder='Username' onChange={this.handleChange} />
          <Form.Input fluid={true} label='Password' placeholder='Password' type="password" onChange={this.handleChange} />
          <a>Forgot password ?</a>
          <br />
          <br />
          <Message success={true} header='Form Completed' content="You're all signed up for the newsletter" />
          <Message error={true} header="Error" content={error && (error as Error).message} />
          <Button type='submit' color="green">Sign in</Button>
        </Form>
      </Layout>
    );
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    { name, value }: any
  ) => {
    const { user } = this.state
    user[name] = value
    this.setState({ user });
  };

  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.setState({ isFetching: true });
    auth.signIn(this.state.user).then(user => {
      this.setState({ user, isSuccess: true })
      this.props.history.push(path.home)
    }).catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }))
  }
}

export default Login;
