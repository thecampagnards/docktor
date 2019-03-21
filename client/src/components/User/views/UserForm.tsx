
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { IUser } from "../types/user";

interface IRouterProps {
    userID: string
}

interface IUserFormStates {
    user: IUser;
}

class UserForm extends React.Component<
  RouteComponentProps<IRouterProps>,
  IUserFormStates
  > {

}

export default UserForm