import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Grid, Label, Table, Checkbox, CheckboxProps } from 'semantic-ui-react';

import { IUser } from '../types/user';
import { path } from '../../../constants/path';

import './Profile.css'
import { IGroup } from '../../Group/types/group';
import { updateUser } from '../../Group/actions/group';

interface IProfileCardProps {
    user: IUser,
    perm: boolean,
    refresh: () => void;
}

export default class ProfileCard extends React.Component<IProfileCardProps> {
    public render() {
        const { user } = this.props

        return (
            <Card centered={true} className="profile">
                <Card.Content>
                    <Grid>
                        <Grid.Column width={13}>
                            <Card.Header>{user.Username.toUpperCase()}</Card.Header>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Label compact="true" color="green">{user.Role}</Label>
                        </Grid.Column>
                    </Grid>
                    <Card.Meta>{user.FirstName + " " + user.LastName}</Card.Meta>
                    <Card.Description>{user.Email}</Card.Description>
                </Card.Content>
                <Card.Content>
                    {user.GroupsData && (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Group</Table.HeaderCell>
                                    <Table.HeaderCell>Role</Table.HeaderCell>
                                    <Table.HeaderCell>Options</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {user.GroupsData.map(group => (
                                    <Table.Row key={group._id}>
                                        <Table.Cell width={8}>{group.Name}</Table.Cell>
                                        <Table.Cell width={4}>
                                            {this.computeGroupRole(group)}
                                        </Table.Cell>
                                        <Table.Cell width={4}>
                                            <Button
                                                icon="box"
                                                as={Link}
                                                to={path.groupsServices.replace(":groupID", group._id)}
                                                title="Access to this group"
                                            />
                                            <Button 
                                                name={group._id}
                                                icon="trash" 
                                                color="red" 
                                                title="Exit this group" 
                                                onClick={this.deleteFromGroup} />
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                    {!user.GroupsData && (
                        <p>
                            <p style={{color: 'red'}}>This account is not assigned to any group.</p>
                            Contact an administrator of the group you want to join : <br />
                            Groups -> Toggle "Display all groups" > use the search filter to find your group > admins of the group are listed below the group title.
            </p>
                    )}
                </Card.Content>
            </Card>
        )

    
    }

    private handleRoleChange = (
        event: React.SyntheticEvent,
        { name, checked }: CheckboxProps
    ) => {
        const username = this.props.user.Username;
        if (checked as boolean) {
            updateUser(name as string, username, "admin");
        } else {
            updateUser(name as string, username, "user");
        }
        this.props.refresh();
    }

    private deleteFromGroup = (
        event: React.SyntheticEvent
    ) => {
        const username = this.props.user.Username;
        updateUser(name as string, username, "delete");
        this.props.refresh();
    }

    private computeGroupRole = (group: IGroup) => {
        const username = this.props.user.Username;
        if (group.Admins) {
            if (group.Admins.indexOf(username) > -1) {
                return (
                    <Checkbox
                        name={group._id}
                        toggle={true}
                        defaultChecked={true}
                        label="admin"
                        onChange={this.handleRoleChange}
                        disabled={!this.props.perm}
                    />
                );
            }
        }
        if (group.Users) {
            if (group.Users.indexOf(username) > -1) {
                return (
                    <Checkbox
                        name={group._id}
                        toggle={true}
                        label="user"
                        onChange={this.handleRoleChange}
                        disabled={!this.props.perm}
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
