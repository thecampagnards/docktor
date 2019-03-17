import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Button, Dropdown, DropdownProps, Grid, Loader, Message, Search, SearchProps
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { fetchGroups } from '../actions/group';
import { IGroup } from '../types/group';
import GroupCard from './GroupCard';

interface IGroupsStates {
  groups: IGroup[];
  groupsFiltered: IGroup[];
  isFetching: boolean;
  error: Error;
}

class Groups extends React.Component<{}, IGroupsStates> {
  public state = {
    groups: [] as IGroup[],
    groupsFiltered: [] as IGroup[],
    isFetching: false,
    error: Error()
  };

  public componentWillMount() {
    fetchGroups()
      .then((groups) => this.setState({ groups, groupsFiltered: groups, isFetching: false }))
      .catch((error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { groups, groupsFiltered, error, isFetching } = this.state;

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
          <Grid.Column width={4}>
            <Search
              size="tiny"
              placeholder="Search groups..."
              showNoResults={false}
              onSearchChange={this.filterGroups}
            />
          </Grid.Column>
          <Grid.Column width={4}>
            <Dropdown
              search={true}
              selection={true}
              clearable={true}
              label="Daemon"
              name="DaemonID"
              placeholder="Select daemon"
              options={groups.map((g: IGroup) => {
                return { text: g.Daemon.Name, value: g.DaemonID };
              })}
              onChange={this.filterByDaemon}
            />
          </Grid.Column>
          <Grid.Column width={6}>
            <Button primary={true} floated="right" as={Link} to={path.groupsNew}>Create group</Button>
          </Grid.Column>
        </Grid>
        { /* TODO Favourite groups ... <Button>Project 1</Button><Button>Project 2</Button> */}
        <Grid>
          {groupsFiltered.slice(0, 16).map((group: IGroup) => (
            <Grid.Column key={group._id} width={4}>
              <GroupCard group={group} />
            </Grid.Column>
          ))}
        </Grid>
      </>
    );
  }

  private filterGroups = (event: React.SyntheticEvent, { value }: SearchProps) => {
    this.setState({ groupsFiltered: this.state.groups.filter(group => group.Name.toLowerCase().includes((value as string).toLowerCase())) })
  }

  private filterByDaemon = (event: React.SyntheticEvent, { value }: DropdownProps) => {
    console.log("Display groups on daemon " + value)
  }
}

export default Groups;
