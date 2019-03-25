import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Button, Grid, Loader, Message, Search, SearchProps, Table
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { fetchUsers } from '../actions/users';
import { IUser } from '../types/user';
import { IGroup } from '../../Group/types/group';

interface IUsersStates {
    users: IUser[];
    usersFiltered: IUser[];
    isFetching: boolean;
    error: Error;
}

class Users extends React.Component<{}, IUsersStates> {
    public state = {
        users: [] as IUser[],
        usersFiltered: [] as IUser[],
        isFetching: false,
        error: Error()
    };
    private searchFilter: string = "";

    public componentWillMount() {
        fetchUsers()
            .then((users) =>
                this.setState({ users, usersFiltered: users, isFetching: false })
            )
            .catch((error) => this.setState({ error, isFetching: false }));
    }

    public render() {
        const { users, usersFiltered, error, isFetching } = this.state;


        if (!users) {
            return (
                <>
                    <h2>Users</h2>
                    <p>No data yet ...</p>;
          </>
            );
        }

        if (error.message) {
            return (
                <>
                    <h2>Users</h2>
                    <Message negative={true}>
                        <Message.Header>
                            Failed to fetch users with error :
            </Message.Header>
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
                    <Grid.Column width={14}>
                        <Search
                            size="tiny"
                            placeholder="Search users..."
                            showNoResults={false}
                            onSearchChange={this.filterSearch}
                        />
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
                    {usersFiltered.slice(0, 20).map((user) => (
                    <Table.Row key={user.Username}>
                        <Table.Cell width={2}>{user.Username}</Table.Cell>
                        <Table.Cell width={3}>{user.FirstName + " " + user.LastName}</Table.Cell>
                        <Table.Cell width={1}>{user.Role}</Table.Cell>
                        <Table.Cell width={8}>
                            {user.GroupsData && user.GroupsData.slice(0, 6).map((group: IGroup) => (
                                <Button compact={true} as={Link} to={path.groupsServices}>{group.Name}</Button>
                            ))}
                            {user.GroupsData && user.GroupsData.length > 6 && (
                                <p>...</p>
                            )}
                        </Table.Cell>
                        <Table.Cell width={2}>
                            <Button compact={true} as={Link} to={path.usersProfile.replace(":userID", user.Username)}>Profile</Button>
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
            user.Username.toLowerCase().includes(value) ||
            user.FirstName.toLowerCase().includes(value) ||
            user.LastName.toLowerCase().includes(value)
        );
        this.setState({ usersFiltered });
      };

      private filterSearch = (
        event: React.SyntheticEvent,
        { value }: SearchProps
      ) => {
        this.searchFilter = value as string;
        this.filterUsers();
      };
}

export default Users