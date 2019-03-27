import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Button, Checkbox, CheckboxProps, Dropdown, DropdownProps, Grid, Loader, Message, Search,
    SearchProps
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { fetchGroups } from '../actions/group';
import { IGroup } from '../types/group';
import GroupCard from './GroupCard';
import { IStoreState } from '../../../types/store';


interface IGroupsProps {
  username: string;
  isAdmin: boolean;
}
interface IGroupsStates {
  groups: IGroup[];
  groupsFiltered: IGroup[];
  isFetching: boolean;
  error: Error;
}

class Groups extends React.Component<IGroupsProps, IGroupsStates> {
  public state = {
    groups: [] as IGroup[],
    groupsFiltered: [] as IGroup[],
    isFetching: false,
    error: Error()
  };
  private searchDaemonID: string = "";
  private searchFilter: string = "";
  private toggleLoading: boolean = false;
  private displayAll: boolean = false;

  public componentWillMount() {
    fetchGroups(false)
      .then(groups =>
        this.setState({ groups, groupsFiltered: groups, isFetching: false })
      )
      .catch(error => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { groups, groupsFiltered, error, isFetching } = this.state;
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
              onSearchChange={this.filterSearch}
            />
          </Grid.Column>
          <Grid.Column width={5}>
            <Dropdown
              search={true}
              selection={true}
              clearable={true}
              label="Daemon"
              name="DaemonID"
              placeholder="Select daemon"
              options={_.uniqBy(groups, "DaemonID").map(g => {
                return g.DaemonData ? { text: g.DaemonData.Name, value: g.DaemonID } : { text: '', value: '' };
              })}
              onChange={this.filterByDaemon}
            />
          </Grid.Column>
          <Grid.Column width={3}>
            <Checkbox
              floated="right"
              slider={true}
              label="Display all groups"
              onChange={this.handleToggle}
              disabled={this.toggleLoading}
            />
          </Grid.Column>
          <Grid.Column width={3}>
            <Button
              primary={true}
              floated="right"
              as={Link}
              to={path.groupsNew}
            >
              Create group
            </Button>
          </Grid.Column>
        </Grid>
        <Grid>
          {groupsFiltered.slice(0, 16).map((group: IGroup) => (
            <Grid.Column key={group._id} width={4}>
              <GroupCard group={group} admin={isAdmin} groupAdmin={isAdmin || (group.Admins.indexOf(username) > -1)} displayButtons={!this.displayAll} />
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
    this.toggleLoading = true;
    this.displayAll = checked as boolean;
    fetchGroups(this.displayAll)
      .then(groups =>
        this.setState({ groups, groupsFiltered: groups, isFetching: false })
      )
      .catch(error => this.setState({ error, isFetching: false }));
      this.toggleLoading = false;
  }

  private filterGroups = () => {
    const groupsFiltered = this.state.groups.filter(
      group =>
        group.Name.toLowerCase().includes(this.searchFilter.toLowerCase()) &&
        (this.searchDaemonID === "" || this.searchDaemonID === group.DaemonID)
    );
    this.setState({ groupsFiltered });
  };

  private filterSearch = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    this.searchFilter = value as string;
    this.filterGroups();
  };

  private filterByDaemon = (
    event: React.SyntheticEvent,
    { value }: DropdownProps
  ) => {
    this.searchDaemonID = value as string;
    this.filterGroups();
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
