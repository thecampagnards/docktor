import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
    Button, Checkbox, CheckboxProps, Form, Grid, InputOnChangeData, Message, Segment
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import auth from '../actions/user';
import { IUser } from '../types/user';

interface ILoginStates {
  isFetching: boolean
  error: Error
}

class Login extends React.Component<RouteComponentProps, ILoginStates> {

  public state = {
    isFetching: false,
    error: Error(),
  }

  private user = {} as IUser
  private LDAP = true

  public render() {
    const { isFetching, error } = this.state
    return (
      <>
        <Grid>
          <Grid.Column width={2}>
            <h2>Login</h2>
          </Grid.Column>
          <Grid.Column width={4}>
            <Segment compact={true}>
              <Checkbox toggle={true} defaultChecked={true} label="LDAP" onChange={this.handleLDAP} />
            </Segment>
          </Grid.Column>
          <Grid.Column width={10}>
            <Button primary={true} floated="right" as={Link} to={path.usersNew}>Create local account</Button>
          </Grid.Column>
        </Grid>

        <Form error={!!error.message} onSubmit={this.submit} loading={isFetching}>
          <Form.Input required={true} fluid={true} label="Username" name="Username" placeholder="Username" onChange={this.handleChange} />
          <Form.Input required={true} fluid={true} label="Password" name="Password" placeholder="Password" type="password" onChange={this.handleChange} />
          <a>Forgot password ?</a>
          <br />
          <br />
          <Message error={true} header="Error" content={error.message} />
          <Button type="submit" color="green">Sign in</Button>
        </Form>
      </>
    )
  }

  private handleLDAP = (
    e: React.ChangeEvent<HTMLInputElement>,
    { value }: CheckboxProps
  ) => {
    this.LDAP = !!value
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ) => {
    this.user[name] = value
  }

  private submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    this.setState({ isFetching: true })
    auth.signIn(this.user, this.LDAP)
      .then(() => this.props.history.push(path.home))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }))
  }
}

export default Login
