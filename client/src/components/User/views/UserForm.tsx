import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Button, Form, InputOnChangeData, Message } from 'semantic-ui-react';

import { IStoreState } from '../../../types/store';
import { registerRequestThunk } from '../actions/user';
import { IUser } from '../types/user';

interface IUserFormProps {
  registerRequest: (user: IUser) => void;
  isFetching: boolean;
  error: string;
}

interface IUserFormStates {
  error: Error;
  pwd: string;
}

class UserForm extends React.Component<
  IUserFormProps & RouteComponentProps,
  IUserFormStates
> {
  public state = {
    pwd: "",
    error: Error()
  };
  private user = {} as IUser;

  public render() {
    const { error } = this.state;
    const { isFetching } = this.props;
    return (
      <>
        <h2>Register</h2>

        <Form
          error={!!error.message || !!this.props.error}
          onSubmit={this.submit}
          loading={isFetching}
        >
          <Form.Input
            required={true}
            fluid={true}
            label="Username"
            name="username"
            placeholder="Username"
            onChange={this.handleChange}
          />
          <Form.Group>
            <Form.Input
              required={true}
              width={8}
              label="First Name"
              name="firstname"
              placeholder="First name"
              onChange={this.handleChange}
            />
            <Form.Input
              required={true}
              width={8}
              label="Last Name"
              name="lastname"
              placeholder="Last name"
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Input
            required={true}
            fluid={true}
            label="E-mail"
            name="email"
            placeholder="E-mail address"
            type="email"
            onChange={this.handleChange}
          />
          <Form.Input
            required={true}
            fluid={true}
            label="Password"
            name="password"
            placeholder="Password"
            type="password"
            onChange={this.handleChange}
          />
          <Form.Input
            required={true}
            fluid={true}
            label="Confirm Password"
            placeholder="Confirm password"
            type="password"
            value={this.state.pwd}
            onChange={this.handlePasswordChange}
          />
          <br />
          <Message
            error={true}
            header="Error"
            content={error.message || this.props.error}
          />
          <Button type="submit" color="green">
            Create account
          </Button>
        </Form>
      </>
    );
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ) => {
    this.user[name] = value;
  };

  private handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => {
    this.setState({ pwd: value });
  };

  private submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (this.state.pwd !== this.user.password) {
      this.setState({ error: Error("Password confirmation does not match") });
      return;
    }

    this.props.registerRequest(this.user);
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { login } = state;
  return {
    error: login.error || "",
    isFetching: login.isFetching || false
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, Action>) => {
  return {
    registerRequest: (user: IUser) => {
      dispatch(registerRequestThunk(user));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserForm);
