import './Profile.css';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Checkbox, CheckboxProps, Grid, Label, Table } from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { updateUser } from '../../Group/actions/group';
import { IGroup } from '../../Group/types/group';
import { IProfile } from '../types/user';

interface IProfileCardProps {
  user: IProfile;
  perm: boolean;
  refresh: () => void;
}

interface IProfileCardStates {
  isFetching: boolean;
}

export default class ProfileCard extends React.Component<
  IProfileCardProps,
  IProfileCardStates
> {
  public state = {
    isFetching: false
  };

  public render() {
    const { user } = this.props;

    return (
      <Card centered={true} className="profile">
        <Card.Content>
          <Grid>
            <Grid.Column width={13}>
              <Card.Header>{user.username.toUpperCase()}</Card.Header>
            </Grid.Column>
            <Grid.Column width={3}>
              <Label compact="true" color="green">
                {user.role}
              </Label>
            </Grid.Column>
          </Grid>
          <Card.Meta>{user.firstname + " " + user.lastname}</Card.Meta>
          <Card.Description>{user.email}</Card.Description>
        </Card.Content>
        <Card.Content>
          {user.groups && (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Group</Table.HeaderCell>
                  <Table.HeaderCell>Role</Table.HeaderCell>
                  <Table.HeaderCell>Options</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {user.groups.map(group => (
                  <Table.Row key={group._id}>
                    <Table.Cell width={8}>{group.name}</Table.Cell>
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
                        onClick={this.deleteFromGroup}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
          {!user.groups && (
            <>
              <pre style={{ color: "red" }}>
                This account is not assigned to any group.
              </pre>
              Contact an administrator of the group you want to join : <br />
              Groups -> Toggle "Display all groups" > use the search filter to
              find your group > admins of the group are listed below the group
              title.
            </>
          )}
        </Card.Content>
      </Card>
    );
  }

  private handleRoleChange = (
    event: React.SyntheticEvent,
    { name, checked }: CheckboxProps
  ) => {
    this.setState({ isFetching: true });
    const username = this.props.user.username;
    updateUser(
      name as string,
      username,
      (checked as boolean) ? "admin" : "user"
    )
      .then(() => this.props.refresh())
      .finally(() => this.setState({ isFetching: false }));
  };

  private deleteFromGroup = (event: React.SyntheticEvent) => {
    this.setState({ isFetching: true });
    const username = this.props.user.username;
    updateUser(name as string, username, "delete")
      .then(() => this.props.refresh())
      .finally(() => this.setState({ isFetching: false }));
  };

  private computeGroupRole = (group: IGroup) => {
    const username = this.props.user.username;
    if (group.admins) {
      if (group.admins.indexOf(username) > -1) {
        return (
          <Checkbox
            name={group._id}
            toggle={true}
            defaultChecked={true}
            label="admin"
            onChange={this.handleRoleChange}
            disabled={!this.props.perm || this.state.isFetching}
          />
        );
      }
    }
    if (group.users) {
      if (group.users.indexOf(username) > -1) {
        return (
          <Checkbox
            name={group._id}
            toggle={true}
            label="user"
            onChange={this.handleRoleChange}
            disabled={!this.props.perm || this.state.isFetching}
          />
        );
      }
    }
    return <Checkbox toggle={true} label="unknown" disabled={true} />;
  };
}
