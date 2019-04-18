import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Button, Checkbox, CheckboxProps, Dropdown, DropdownProps, Grid, Loader, Message, Search,
    SearchProps
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { IStoreState } from '../../../types/store';
import { fetchDaemons } from '../../Daemon/actions/daemon';
import { IDaemon } from '../../Daemon/types/daemon';
import { fetchGroups } from '../actions/group';
import { IGroup } from '../types/group';
import GroupCard from './GroupCard';

interface IGroupsProps {
  username: string;
  isAdmin: boolean;
}
interface IGroupsStates {
  groups: IGroup[];
  daemons: IDaemon[];
  isFetching: boolean;
  error: Error;

  searchFilter: string;
  searchDaemonID: string;
}

class Groups extends React.Component<IGroupsProps, IGroupsStates> {
  public state = {
    groups: [] as IGroup[],
    daemons: [] as IDaemon[],
    isFetching: false,
    error: Error(),

    searchFilter: "",
    searchDaemonID: ""
  };

  private displayAll: boolean = false;

  public componentWillMount() {
    fetchGroups(false)
      .then(groups => this.setState({ groups, isFetching: false }))
      .catch(error => this.setState({ error, isFetching: false }));

    fetchDaemons().then(daemons => this.setState({ daemons }));
  }

  public render() {
    const {
      daemons,
      groups,
      error,
      isFetching,
      searchDaemonID,
      searchFilter
    } = this.state;
    const { username, isAdmin } = this.props;

    if (error.message) {
      return (
        <>
          <h2>Groups</h2>
          <Message negative={true}>
            <Message.Header>Failed to load groups with error :</Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    if (isFetching) {
      return (
        <>
          <h2>Groups</h2>
          <Loader active={true} />
        </>
      );
    }

    const groupsFiltered = groups
      ? groups.filter(
          group =>
            group.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
            (searchDaemonID === "" || searchDaemonID === group.daemon_id)
        )
      : [];

    return (
      <>
        <Grid>
          <Grid.Column width={2}>
            <h2>Groups</h2>
          </Grid.Column>
          <Grid.Column width={3}>
            <Search
              size="tiny"
              placeholder="Search groups..."
              showNoResults={false}
              name="filter"
              onSearchChange={this.filter}
            />
          </Grid.Column>
          <Grid.Column width={5}>
            <Dropdown
              search={true}
              selection={true}
              clearable={true}
              label="Daemon"
              name="searchDaemonID"
              placeholder="Select daemon"
              options={daemons.map(d => {
                return { text: d.name, value: d._id };
              })}
              onChange={this.filter}
            />
          </Grid.Column>
          <Grid.Column width={3}>
            <Checkbox
              floated="right"
              slider={true}
              label="Display all groups"
              onChange={this.handleToggle}
            />
          </Grid.Column>
          <Grid.Column width={3}>
            {isAdmin && (
              <Button
                primary={true}
                floated="right"
                as={Link}
                to={path.groupsNew}
                icon="plus"
                content="Create group"
                labelPosition="left"
              />
            )}
          </Grid.Column>
        </Grid>
        <Grid>
          {groupsFiltered.slice(0, 16).map((group: IGroup) => (
            <Grid.Column key={group._id} width={4}>
              <GroupCard
                group={group}
                admin={isAdmin}
                groupAdmin={isAdmin || group.admins.includes(username)}
                displayButtons={!this.displayAll}
              />
            </Grid.Column>
          ))}
        </Grid>
      </>
    );
  }

  private handleToggle = (
    event: React.SyntheticEvent,
    { checked }: CheckboxProps
  ) => {
    this.displayAll = checked as boolean;
    fetchGroups(this.displayAll)
      .then(groups => this.setState({ groups, isFetching: false }))
      .catch(error => this.setState({ error, isFetching: false }));
  };

  private filter = (
    event: React.SyntheticEvent,
    { value, name }: SearchProps | DropdownProps
  ) => {
    this.state[name] = value as string;
    this.setState(this.state);
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { login } = state;
  return {
    username: login.username,
    isAdmin: !!login.isAdmin,
    isAuthenticated: login.username !== ""
  };
};

export default connect(mapStateToProps)(Groups);
