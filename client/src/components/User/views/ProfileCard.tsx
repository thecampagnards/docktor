import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Grid, Label, Table, Checkbox } from 'semantic-ui-react';

import { IUser } from '../types/user';
import { path } from '../../../constants/path';

import './Profile.css'

interface IProfileCardProps {
    user: IUser
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
                            <Label compact={true} color="green">{user.Role}</Label>
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
                                            <Checkbox
                                                toggle={true}
                                                label="Admin"
                                                disabled={user.Role === "user"}
                                            />
                                        </Table.Cell>
                                        <Table.Cell width={4}>
                                            <Button icon="trash" color="red" title="Exit this group" />
                                            <Button
                                                icon="info"
                                                as={Link}
                                                to={path.groupsMore.replace(":groupID", group._id)}
                                                title="Access to this group"
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                    {!user.GroupsData && (
                        <p>
                            Your account is not assigned to any group.
            </p>
                    )}
                </Card.Content>
            </Card>
        )
    }
}