
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  Button, Form, InputOnChangeData, Message
} from 'semantic-ui-react';
import { IUser } from "../types/user";

interface IUserFormProps {
  isFetching: boolean;
  error: string;
  registerRequest: (user: IUser) => void;
}

class UserForm extends React.Component<RouteComponentProps &IUserFormProps> {

  private user = {} as IUser;

  public render() {
    const { isFetching, error } = this.props;
    return (
      <>
      <h2>Register</h2>

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
          <Form.Group fuild={true}>
            <Form.Input
              required={true}
              width={8}
              label="First Name"
              name="FirstName"
              placeholder="First Name"
              onChange={this.handleChange}
            />
            <Form.Input
              required={true}
              width={8}
              label="Last Name"
              name="LastName"
              placeholder="Last Name"
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Input
            required={true}
            fluid={true}
            label="E-mail"
            name="Email"
            placeholder="E-mail address"
            type="email"
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
          <Form.Input
            required={true}
            fluid={true}
            label="Confirm Password"
            name="ConfirmPwd"
            placeholder="Confirm Password"
            type="password"
            onChange={this.checkPassword}
          />
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

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ) => {
    this.user[name] = value;
  };

  private checkPassword = (
    e: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => {
    return;
  }

  private submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    this.user.Role = "user";

    this.setState({ isFetching: true });
    this.props.registerRequest(this.user)
  };
}

export default UserForm