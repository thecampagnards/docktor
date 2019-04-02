import * as _ from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Button, ButtonProps, Grid, Loader, Icon, Message, Search, SearchProps, Table
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { fetchDaemons, checkDaemonStatus } from '../actions/daemon';
import { IDaemon } from '../types/daemon';

interface IDaemonsStates {
  daemons: IDaemon[];
  daemonsFiltered: IDaemon[];
  daemonStatuses: boolean[];
  tagsFilter: string[];
  isFetching: boolean;
  error: Error;
}

class Daemons extends React.Component<{}, IDaemonsStates> {
  public state = {
    daemons: [] as IDaemon[],
    daemonsFiltered: [] as IDaemon[],
    daemonStatuses: [] as boolean[],
    tagsFilter: [] as string[],
    isFetching: false,
    error: Error()
  };

  private searchField = "";

  public componentWillMount() {
    fetchDaemons()
      .then(daemons => {
        this.setState({ daemons, daemonsFiltered: daemons, isFetching: false });
        for (const daemon of daemons) {
          checkDaemonStatus(daemon._id)
            .then(() => {
              const { daemonStatuses } = this.state
              daemonStatuses[daemon._id] = true
              this.setState({daemonStatuses})
            })
            .catch(() => {
              const { daemonStatuses } = this.state
              daemonStatuses[daemon._id] = false
              this.setState({daemonStatuses})
            });
        }
      })
      .catch(error => this.setState({ error, isFetching: false }));
  }

  public render() {
    const {
      daemons,
      daemonsFiltered,
      daemonStatuses,
      tagsFilter,
      error,
      isFetching
    } = this.state;

    if (!daemons) {
      return (
        <>
          <h2>Daemons</h2>
          <p>No data yet ...</p>;
        </>
      );
    }

    if (error.message) {
      return (
        <>
          <h2>Daemons</h2>
          <Message negative={true}>
            <Message.Header>
              Failed to fetch daemons with error :
            </Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    if (isFetching) {
      return (
        <>
          <h2>Daemons</h2>
          <Loader active={true} />
        </>
      );
    }

    let tags: string[] = [];
    for (const d of daemons) {
      tags = _.union(tags, d.Tags);
    }

    return (
      <>
        <Grid>
          <Grid.Column width={2}>
            <h2>Daemons</h2>
          </Grid.Column>
          <Grid.Column width={4}>
            <Search
              size="tiny"
              placeholder="Search daemons..."
              showNoResults={false}
              onSearchChange={this.filterAddSearchField}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            {tags.map(tag => (
              <Button
                key={tag}
                compact={true}
                toggle={true}
                active={tagsFilter.indexOf(tag) > -1}
                onClick={this.filterAddTags}
                value={tag}
              >
                {tag}
              </Button>
            ))}
          </Grid.Column>
          <Grid.Column width={3}>
            <Button
              primary={true}
              floated="right"
              as={Link}
              to={path.daemonsNew}
            >
              Add daemon
            </Button>
          </Grid.Column>
        </Grid>
        <Table celled={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Host</Table.HeaderCell>
              <Table.HeaderCell>Tools</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {daemonsFiltered.slice(0, 20).map(daemon => (
              <Table.Row key={daemon._id}>
                <Table.Cell>{daemon.Name}</Table.Cell>
                <Table.Cell>
                  {daemonStatuses[daemon._id] ?
                    <Icon color="green" name="check circle outline" /> :
                    <Icon color="red" name="warning" />
                  }
                </Table.Cell>
                <Table.Cell>{daemon.Host}</Table.Cell>
                <Table.Cell>
                  <Button.Group fluid={true}>
                    <Button
                      icon="chart area"
                      content="CAdvisor"
                      disabled={!daemon.CAdvisor}
                      as={Link}
                      to={path.daemonsCAdvisor.replace(":daemonID", daemon._id)}
                    />
                    <Button
                      icon="docker"
                      content="Containers"
                      disabled={!daemon.Docker}
                      as={Link}
                      to={path.daemonsContainers.replace(
                        ":daemonID",
                        daemon._id
                      )}
                    />
                    <Button
                      icon="terminal"
                      content="SSH"
                      disabled={!daemon.SSH}
                      as={Link}
                      to={path.daemonsSSH.replace(":daemonID", daemon._id)}
                    />
                    <Button
                      icon="edit"
                      content="Edit"
                      as={Link}
                      to={path.daemonsEdit.replace(":daemonID", daemon._id)}
                    />
                    <Button
                      icon="cog"
                      content="More"
                      as={Link}
                      to={path.daemonsMore.replace(":daemonID", daemon._id)}
                    />
                  </Button.Group>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </>
    );
  }

  private filter = () => {
    const { tagsFilter } = this.state;

    let daemonsFiltered = this.state.daemons.filter(daemons =>
      daemons.Name.toLowerCase().includes(this.searchField.toLowerCase())
    );
    if (tagsFilter.length > 0) {
      daemonsFiltered = daemonsFiltered.filter(
        d => _.intersectionWith(d.Tags, tagsFilter, _.isEqual).length !== 0
      );
    }
    this.setState({ daemonsFiltered });
  };

  private filterAddSearchField = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    this.searchField = value as string;
    this.filter();
  };

  private filterAddTags = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    { value }: ButtonProps
  ) => {
    const { tagsFilter } = this.state;
    const index = tagsFilter.indexOf(value);
    index === -1 ? tagsFilter.push(value) : tagsFilter.splice(index, 1);
    this.setState({ tagsFilter });
    this.filter();
  };
}

export default Daemons;
