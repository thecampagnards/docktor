import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Button, Card, Loader, Message, Table } from 'semantic-ui-react';

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
            <Card.Header>{user.Username}</Card.Header>
            <Card.Meta>{user.FirstName + " " + user.LastName}</Card.Meta>
          </Card.Content>
        </Card>

        {user.Groups.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Group</Table.HeaderCell>
                <Table.HeaderCell>Rights</Table.HeaderCell>
                <Table.HeaderCell>Options</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {user.Groups.map(group => (
                <Table.Row key={group._id}>
                  <Table.Cell width={2}>{group.Name}</Table.Cell>
                  <Table.Cell width={4}>
                    <ReactMarkdown source={group.Description} />
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
      </>
    );
  }
}

export default Profile;
