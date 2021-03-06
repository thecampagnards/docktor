import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Grid, Loader, Message, Search, SearchProps, Table } from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { IGroup } from '../../Group/types/group';
import { fetchUsers } from '../actions/users';
import { IProfile } from '../types/user';

interface IUsersStates {
  users: IProfile[];
  usersFiltered: IProfile[];
  isFetching: boolean;
  error: Error;
}

class Users extends React.Component<{}, IUsersStates> {
  public state = {
    users: [] as IProfile[],
    usersFiltered: [] as IProfile[],
    isFetching: false,
    error: Error()
  };
  private searchFilter = "";

  public componentDidMount() {
    fetchUsers()
      .then(users => this.setState({ users, usersFiltered: users }))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { usersFiltered, error, isFetching } = this.state;

    if (error.message) {
      return (
        <>
          <h2>Users</h2>
          <Message negative={true}>
            <Message.Header>Failed to fetch users with error :</Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    if (isFetching) {
      return (
        <>
          <h2>Users</h2>
          <Loader active={true} />
        </>
      );
    }

    return (
      <>
        <Grid>
          <Grid.Column width={2}>
            <h2>Users</h2>
          </Grid.Column>
          <Grid.Column width={6}>
            <Search
              size="tiny"
              placeholder="Search users..."
              showNoResults={false}
              onSearchChange={this.filterSearch}
            />
          </Grid.Column>
          <Grid.Column width={8}>
            <Button primary={true} floated="right" as={Link} to={path.usersNew} content="Create local account" />
          </Grid.Column>
        </Grid>
        <Table celled={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Username</Table.HeaderCell>
              <Table.HeaderCell>Full name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Groups</Table.HeaderCell>
              <Table.HeaderCell>Options</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {usersFiltered.slice(0, 20).map(user => (
              <Table.Row key={user.username}>
                <Table.Cell width={1}>{user.username}</Table.Cell>
                <Table.Cell width={2}>
                  {user.firstname + " " + user.lastname}
                </Table.Cell>
                <Table.Cell width={1}>{user.role}</Table.Cell>
                <Table.Cell width={11}>
                  {user.groups &&
                    user.groups.map((group: IGroup) => (
                      <Button
                        key={group._id}
                        basic={true}
                        compact={true}
                        content={group.name}
                        as={Link}
                        to={path.groupsSummary.replace(":groupID", group._id)}
                      />
                    ))}
                </Table.Cell>
                <Table.Cell width={1}>
                  <Button
                    compact={true}
                    color="blue"
                    as={Link}
                    to={path.usersProfile.replace(":userID", user.username)}
                  >
                    Profile
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </>
    );
  }

  private filterUsers = () => {
    const value = this.searchFilter.toLowerCase();
    const usersFiltered = this.state.users.filter(
      user =>
        user.username.toLowerCase().includes(value) ||
        user.firstname.toLowerCase().includes(value) ||
        user.lastname.toLowerCase().includes(value)
    );
    this.setState({ usersFiltered });
  };

  private filterAdmins = () => {
    const usersFiltered = this.state.users.filter(user => user.role === "admin");
    this.setState({ usersFiltered });
  }

  private filterSearch = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    this.searchFilter = value as string;
    if (this.searchFilter === "admin") {
      this.filterAdmins();
    } else {
      this.filterUsers();
    }
  };
}

export default Users;
