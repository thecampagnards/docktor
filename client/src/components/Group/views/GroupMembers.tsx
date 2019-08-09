import * as React from 'react';
import {
    Button, ButtonProps, Checkbox, CheckboxProps, Grid, Icon, Label, Message, Search, SearchProps,
    Table
} from 'semantic-ui-react';

import { copy } from '../../../utils/clipboard';
import { updateUser } from '../../Group/actions/group';
import { fetchUser, fetchUsers } from '../../User/actions/users';
import { IUser } from '../../User/types/user';
import { IGroup } from '../types/group';

interface IGroupProps {
  group: IGroup;
  admin: boolean;
  refresh: () => void;
}

interface IGroupStates {
  members: IUser[];
  allUsers: string[];
  labelText: string;
  searchText: string;
  isFetching: boolean;
  error: Error;
}

class GroupMembers extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    members: [] as IUser[],
    allUsers: [] as string[],
    labelText: "Add a user to the group",
    searchText: "",
    isFetching: true,
    error: Error()
  };

  public componentDidMount() {
    fetchUsers().then(users =>
      this.setState({ allUsers: users.map((u: IUser) => u.username) })
    );

    const { group } = this.props;
    const usernames = group.users.concat(group.admins);
    usernames.forEach(username => {
      fetchUser(username)
        .then(u => {
          const members: IUser[] = this.state.members;
          members.push(u);
          this.setState({ members });
        })
        .catch(() => console.warn(`User ${username} not found`))
        .finally(() => this.setState({ isFetching: false }));
    });
  }

  public render() {
    const {
      members,
      allUsers,
      labelText,
      searchText,
      error,
      isFetching
    } = this.state;
    const { admin } = this.props;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>There was an issue</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    return (
      <>
        <Grid>
          <Grid.Column width={4}>
            <Search
              name="username"
              placeholder="Search a user"
              onResultSelect={this.handleSelectResult}
              onSearchChange={this.handleSearchChange}
              results={allUsers
                .filter(s => s.includes(searchText))
                .map(s => ({ title: s }))}
              disabled={!admin}
            />
          </Grid.Column>
          <Grid.Column width={6}>
            <Button
              color="green"
              icon={true}
              labelPosition="right"
              onClick={this.addToGroup}
              disabled={isFetching || !admin}
            >
              <Icon name="add user" />
              Confirm
            </Button>
            <Label pointing="left">{labelText}</Label>
          </Grid.Column>
          <Grid.Column width={6}>
            <Button
              icon={true}
              color="blue"
              labelPosition="right"
              onClick={this.copyAll}
              floated="right"
            >
              <Icon name="clipboard" /> Copy all e-mails
            </Button>
          </Grid.Column>
        </Grid>
        {members.length > 0 && (
          <Table celled={true}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Role</Table.HeaderCell>
                <Table.HeaderCell>Options</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {members.map(user => (
                <Table.Row key={user.username}>
                  <Table.Cell
                    width={8}
                  >{`${user.firstname} ${user.lastname}  (${user.username})`}</Table.Cell>
                  <Table.Cell width={3}>
                    {this.computeGroupRole(user.username, admin)}
                  </Table.Cell>
                  <Table.Cell width={5}>
                    <Button
                      icon="mail"
                      title="Send Email"
                      as="a"
                      href={`mailto:${user.email}`}
                    />
                    <Button
                      icon="copy"
                      title="Copy Email"
                      onClick={copy.bind(this, user.email)}
                    />
                    <Button
                      icon="trash"
                      title="Delete from group"
                      color="red"
                      name={user.username}
                      onClick={this.deleteFromGroup}
                      disabled={!admin}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        {members.length === 0 && (
          <Message info={true}>
            <Message.Header>
              There is no member in this group yet.
            </Message.Header>
            <Message.Content>Add an administrator...</Message.Content>
          </Message>
        )}
      </>
    );
  }

  private copyAll = () => {
    const { members } = this.state;
    const mails = members.map(u => u.email).join(";");
    copy(mails);
  };

  private handleSearchChange = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    const text = value as string;
    this.setState({ searchText: text });
  };

  private handleSelectResult = (
    event: React.SyntheticEvent,
    { result }: SearchProps
  ) => {
    const text = result.title as string;
    this.setState({ searchText: text });
  };

  private addToGroup = () => {
    const groupID = this.props.group._id;
    const { members, searchText } = this.state;
    const username = searchText;

    if (!username || username.length === 0) {
      this.setState({ labelText: "Add a user to the group" });
      return;
    }
    if (members.map(u => u.username).indexOf(username) > -1) {
      this.setState({ labelText: "This user is already in the group" });
      return;
    }

    fetchUser(username)
      .then(u => {
        this.setState({ isFetching: true });
        updateUser(groupID, username, "user")
          .then(() => {
            members.push(u);
            this.setState({ members, labelText: "Add a user to the group" });
          })
          .catch((error: Error) => this.setState({ labelText: error.message }))
          .finally(() => this.setState({ isFetching: false }));
      })
      .catch((error: Error) =>
        this.setState({ labelText: `User "${username}" does not exist` })
      );
  };

  private deleteFromGroup = (
    event: React.SyntheticEvent,
    { name }: ButtonProps
  ) => {
    this.setState({ isFetching: true });
    const groupID = this.props.group._id;
    const username = name as string;
    updateUser(groupID, username, "delete")
      .then(() => {
        const members = this.state.members.filter(u => u.username !== username);
        this.setState({ members });
      })
      .finally(() => this.setState({ isFetching: false }));
  };

  private handleRoleChange = (
    event: React.SyntheticEvent,
    { name, checked }: CheckboxProps
  ) => {
    this.setState({ isFetching: true });
    const groupID = this.props.group._id;
    const username = name as string;
    const newRole = (checked as boolean) ? "admin" : "user";
    updateUser(groupID, username, newRole)
      .then(() => this.props.refresh())
      .finally(() => this.setState({ isFetching: false }));
  };

  private computeGroupRole = (username: string, admin: boolean) => {
    const { group } = this.props;
    if (group.admins) {
      if (group.admins.indexOf(username) > -1) {
        return (
          <Checkbox
            name={username}
            toggle={true}
            defaultChecked={true}
            label="admin"
            onChange={this.handleRoleChange}
            disabled={!admin || this.state.isFetching}
          />
        );
      }
    }
    if (group.users) {
      if (group.users.indexOf(username) > -1) {
        return (
          <Checkbox
            name={username}
            toggle={true}
            label="user"
            onChange={this.handleRoleChange}
            disabled={!admin || this.state.isFetching}
          />
        );
      }
    }
    return <Checkbox toggle={true} label="unknown" disabled={true} />;
  };
}

export default GroupMembers;
