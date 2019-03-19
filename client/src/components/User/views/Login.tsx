import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import {
    Button, Checkbox, CheckboxProps, Form, Grid, InputOnChangeData, Message, Segment
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { IStoreState } from '../../../types/store';
import { loginRequestThunk } from '../actions/user';
import { IUser } from '../types/user';

interface ILoginProps {
  isFetching: boolean;
  error: string;
  loginRequest: (user: IUser, ldap: boolean) => void;
}

class Login extends React.Component<RouteComponentProps & ILoginProps> {

  private user = {} as IUser;
  private LDAP = true;

  public render() {
    const { isFetching, error } = this.props;
    return (
      <>
        <Grid>
          <Grid.Column width={2}>
            <h2>Login</h2>
          </Grid.Column>
          <Grid.Column width={4}>
            <Segment compact={true}>
              <Checkbox
                toggle={true}
                defaultChecked={true}
                label="LDAP"
                onChange={this.handleLDAP}
              />
            </Segment>
          </Grid.Column>
          <Grid.Column width={10}>
            <Button primary={true} floated="right" as={Link} to={path.usersNew}>
              Create local account
            </Button>
          </Grid.Column>
        </Grid>

        <Form
          error={!!error}
          onSubmit={this.submit}
          loading={isFetching}
        >
          <Form.Input
            required={true}
            fluid={true}
            label="Username"
            name="Username"
            placeholder="Username"
            onChange={this.handleChange}
          />
          <Form.Input
            required={true}
            fluid={true}
            label="Password"
            name="Password"
            placeholder="Password"
            type="password"
            onChange={this.handleChange}
          />
          <a>Forgot password ?</a>
          <br />
          <br />
          <Message error={true} header="Error" content={error} />
          <Button type="submit" color="green">
            Sign in
          </Button>
        </Form>
      </>
    );
  }

  private handleLDAP = (
    e: React.ChangeEvent<HTMLInputElement>,
    { checked }: CheckboxProps
  ) => {
    this.LDAP = !!checked;
  };

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ) => {
    this.user[name] = value;
  };

  private submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    this.setState({ isFetching: true });
    this.props.loginRequest(this.user, this.LDAP)
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { login } = state;
  return {
    error: login.error || "",
    isFetching: login.isFetching || false,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {
    loginRequest: (user: IUser, ldap: boolean) => {
      dispatch(loginRequestThunk(user, ldap));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

