import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Card, Table } from 'semantic-ui-react';

import { GetProfile } from '../actions/user';
import { IUser } from '../types/user';
import { IGroup } from 'src/components/Group/types/group';

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
    return (
      <>
      <Card centered={true} fluid={true} width={6} height={6}>

        <Card.Content>
          <Card.Header>{this.user.Username}</Card.Header>
          <Card.Meta>{this.user.Firstname + " " + this.user.Lastname}</Card.Meta>
        </Card.Content>

        <Card.Content>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Group</Table.HeaderCell>
                <Table.HeaderCell>Rights</Table.HeaderCell>
                <Table.HeaderCell>Options</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.user.Groups.map((group: IGroup) => (
                <Table.Row key={group._id}>
                  <Table.Cell width={2}>{group.Name}</Table.Cell>
                  <Table.Cell width={4}>{group.Description}</Table.Cell>
                  <Table.Cell width={4}>
                  <Button.Group>
                    <Button
                      icon="trash"
                      color="red"
                    />
                  </Button.Group>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>

      </Card>
      </>
    )
  }
}

export default Profile;
