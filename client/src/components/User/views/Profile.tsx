import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Grid, Label, Loader, Message, Table } from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { GetProfile } from '../actions/user';
import { IUser } from '../types/user';

interface IProfileStates {
  user: IUser;
  isFetching: boolean;
  error: Error;
}

class Profile extends React.Component<{}, IProfileStates> {
  public state = {
    user: {} as IUser,
    isFetching: true,
    error: Error()
  };

  public componentWillMount() {
    GetProfile()
      .then(user => this.setState({ user, isFetching: false }))
      .catch(error => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { user, isFetching, error } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>Failed to load profile with error :</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <>
        <Card centered={true}>
          <Card.Content>
            <Grid>
              <Grid.Column width={12}>
                <Card.Header>{user.Username.toUpperCase()}</Card.Header>
              </Grid.Column>
              <Grid.Column width={4}>
                <Label compact={true} color="green">{user.Role}</Label>
              </Grid.Column>
            </Grid>
            <Card.Meta>{user.FirstName + " " + user.LastName}</Card.Meta>
          </Card.Content>
          {user.Groups.length > 0 && (
          <Card.Content>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Group</Table.HeaderCell>
                  <Table.HeaderCell>Role</Table.HeaderCell>
                  <Table.HeaderCell>Options</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {user.Groups.map(group => (
                  <Table.Row key={group._id}>
                    <Table.Cell width={6}>{group.Name}</Table.Cell>
                    <Table.Cell width={2}>
                      <Label compact={true} color="green">User</Label>
                    </Table.Cell>
                    <Table.Cell width={8}>
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
          </Card.Content>
          )}
        </Card>
      </>
    );
  }
}

export default Profile;
