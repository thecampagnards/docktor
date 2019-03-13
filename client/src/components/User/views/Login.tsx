import * as React from "react";

import Layout from 'src/components/layout/layout';
import { Link } from "react-router-dom";
import { Form, Button, Grid, Message, Checkbox, Segment } from 'semantic-ui-react';

import { IUser } from '../types/user';
import { path } from '../../../constants/path';
import { RouteComponentProps } from 'react-router-dom';
import auth from '../actions/user';

interface ILoginStates {
  isFetching: boolean;
  isSuccess: boolean;
  error: Error | null;
}

class Login extends React.Component<RouteComponentProps, ILoginStates> {

  public state = {
    isFetching: false,
    isSuccess: false,
    error: null,
  };

  private user = {} as IUser

  public render() {

    const { isSuccess, isFetching, error } = this.state

    return (
      <Layout>
        <Grid>
          <Grid.Column width={2}>
            <h2>Login</h2>
          </Grid.Column>
          <Grid.Column width={4}>
          <Segment compact={true}>
            <Checkbox toggle={true} defaultChecked={true} label="LDAP"/>
          </Segment>
          </Grid.Column>
          <Grid.Column width={10}>
            <Button primary={true} floated="right" as={Link} to={path.usersNew}>Create local account</Button>
          </Grid.Column>
        </Grid>
        
        <Form success={isSuccess} error={error !== null} onSubmit={this.submit} loading={isFetching}>
          <Form.Input required={true} fluid={true} label='Username' name='Username' placeholder='Username' onChange={this.handleChange} />
          <Form.Input required={true} fluid={true} label='Password' name='Password' placeholder='Password' type="password" onChange={this.handleChange} />
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
    this.user[name] = value
  };


  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.setState({ isFetching: true });
    auth.signIn(this.user).then(user => {
      this.props.history.push(path.home)
    }).catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }))
  }
}

export default Login;
