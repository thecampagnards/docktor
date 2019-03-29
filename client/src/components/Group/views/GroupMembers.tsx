import { IGroup } from "../types/group";
import * as React from 'react';
import { IUser } from '../../User/types/user';
import { fetchUser } from '../../User/actions/users';
import { Loader, Message, Table, Button, Checkbox, CheckboxProps, ButtonProps, Grid } from 'semantic-ui-react';
import { updateUser } from '../../Group/actions/group';

interface IGroupProps {
    group: IGroup;
}

interface IGroupStates {
    members: IUser[];
    isFetching: boolean;
    error: Error;
}

class GroupMembers extends React.Component<IGroupProps, IGroupStates> {
    public state = {
        members: [] as IUser[],
        isFetching: true,
        error: Error()
    };

    public componentWillMount() {
        const { group } = this.props;
        const usernames = group.Users.concat(group.Admins);
        usernames.map(username => {
            fetchUser(username)
                .then(u => {
                    const members: IUser[] = this.state.members;
                    members.push(u);
                    this.setState({ members, isFetching: false });
                })
                .catch(error => this.setState({ error, isFetching: false }));
        });
    }

    public render() {
        const { members, error, isFetching } = this.state;

        if (error.message) {
            return (
                <Message negative={true}>
                    <Message.Header>There was an issue</Message.Header>
                    <p>{error.message}</p>
                </Message>
            );
        }

        if (members.length === 0) {
            return (
                <Message info={true}>
                    <Message.Header>There is no member in this group yet.</Message.Header>
                    <Message.Content>Add an administrator...</Message.Content>
                </Message>
            );
        }

        if (isFetching) {
            return <Loader active={true} />;
        }

        return (
            <>
                <Grid>
                    <Grid.Column width={8}>Add member ...</Grid.Column>
                    <Grid.Column width={8}>Copy all mails</Grid.Column>
                </Grid>
                <Table celled={true}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Role</Table.HeaderCell>
                            <Table.HeaderCell>Options</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    {members.map(user => (
                        <Table.Row key={user.Username}>
                            <Table.Cell>{`${user.FirstName} ${user.LastName}  (${user.Username})`}</Table.Cell>
                            <Table.Cell>{this.computeGroupRole(user.Username)}</Table.Cell>
                            <Table.Cell>
                                <Button icon="copy" title="Copy Email" onClick={this.copyEmail.bind(this, user.Email)} />
                                <Button icon="trash" title="Delete from group" name={user.Username} onClick={this.deleteFromGroup} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table>
            </>
        )
    }

    private copyEmail = (value: string) => {
        document.addEventListener("copy", (e: ClipboardEvent) => {
            e.clipboardData.setData("text/plain", value);
            e.preventDefault();
            document.removeEventListener("copy", this.copyEmail.bind(this));
        });
        document.execCommand("copy");
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
                const members = this.state.members.filter(u => u.Username !== username);
                this.setState({ members });
            })
            .finally(() => this.setState({ isFetching: false }));
    }

    private handleRoleChange = (
        event: React.SyntheticEvent,
        { name, checked }: CheckboxProps
    ) => {
        this.setState({ isFetching: true });
        const groupID = this.props.group._id;
        const username = name as string;
        const newRole = checked as boolean ? "admin" : "user";
        updateUser(groupID, username, newRole)
            .then(() => {
                const members = this.state.members.map(u => {
                    if (u.Username === username) {
                        u.Role = newRole;
                    }
                    return u;
                });
                this.setState({ members });
            })
            .finally(() => this.setState({ isFetching: false }));
    }

    private computeGroupRole = (username: string) => {
        // TODO handle perm
        const { group } = this.props;
        if (group.Admins) {
            if (group.Admins.indexOf(username) > -1) {
                return (
                    <Checkbox
                        name={username}
                        toggle={true}
                        defaultChecked={true}
                        label="admin"
                        onChange={this.handleRoleChange}
                        disabled={false || this.state.isFetching}
                    />
                );
            }
        }
        if (group.Users) {
            if (group.Users.indexOf(username) > -1) {
                return (
                    <Checkbox
                        name={username}
                        toggle={true}
                        label="user"
                        onChange={this.handleRoleChange}
                        disabled={false || this.state.isFetching}
                    />
                );
            }
        }
        return (
            <Checkbox
                toggle={true}
                label="unknown"
                disabled={true}
            />
        );
    }
}

export default GroupMembers;