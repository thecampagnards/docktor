import * as _ from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Button, ButtonProps, Grid, Icon, IconProps, Loader, Message, Search, SearchProps,
    SemanticShorthandItem, Table
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { fetchDaemons } from '../actions/daemon';
import { dockerStatus, IDaemon } from '../types/daemon';

interface IDaemonsStates {
  daemons: IDaemon[];
  isFetching: boolean;
  error: Error;

  tagsFilter: string[];
  statusFilter: dockerStatus[];
  searchField: string;
}

class Daemons extends React.Component<{}, IDaemonsStates> {
  public state = {
    daemons: [] as IDaemon[],
    isFetching: false,
    error: Error(),

    tagsFilter: [] as string[],
    statusFilter: ["OK", "DOWN", "", "CERT"] as dockerStatus[],
    searchField: ""
  };

  public componentWillMount() {
    fetchDaemons()
      .then(daemons => {
        this.setState({ daemons });
      })
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const {
      daemons,
      error,
      isFetching,

      tagsFilter,
      statusFilter,
      searchField
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

    // Filter by search text
    let daemonsFiltered = daemons.filter(daemon =>
      daemon.name.toLowerCase().includes(searchField.toLowerCase())
    );

    // filter by tags
    if (tagsFilter.length > 0) {
      daemonsFiltered = daemonsFiltered.filter(
        d => _.intersectionWith(d.tags, tagsFilter, _.isEqual).length !== 0
      );
    }

    // filter by status
    if (statusFilter.length > 0) {
      daemonsFiltered = daemonsFiltered.filter(
        d => statusFilter.indexOf(d.docker.status) !== -1
      );
    }

    // Keep only 20
    daemonsFiltered = daemonsFiltered.slice(0, 20);

    let tags: string[] = [];
    for (const d of daemons) {
      tags = _.union(tags, d.tags);
    }

    return (
      <>
        <Grid>
          <Grid.Column width={2}>
            <h2>Daemons</h2>
          </Grid.Column>
          <Grid.Column width={3}>
            <Search
              size="tiny"
              placeholder="Search daemons..."
              showNoResults={false}
              onSearchChange={this.filterAddSearchField}
            />
          </Grid.Column>
          <Grid.Column width={3}>
            {["OK", "DOWN", "", "CERT", "OLD"].map(status => (
              <Button
              compact={true}
              icon={true}
              key={status}
              toggle={true}
              active={statusFilter.indexOf(status as dockerStatus) > -1}
              onClick={this.filterAddStatus}
              value={status}
            >
              {this.getDockerStatus(status as dockerStatus)}
            </Button>
            ))}
          </Grid.Column>
          <Grid.Column width={5}>
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
            {daemonsFiltered.map(daemon => (
              <Table.Row key={daemon._id}>
                <Table.Cell>{daemon.name}</Table.Cell>
                <Table.Cell>
                  {this.getDockerStatus(daemon.docker.status)}
                </Table.Cell>
                <Table.Cell>{daemon.host}</Table.Cell>
                <Table.Cell>
                  <Button.Group fluid={true}>
                    <Button
                      icon="chart area"
                      content="CAdvisor"
                      disabled={!daemon.cadvisor}
                      as={Link}
                      to={path.daemonsCAdvisor.replace(":daemonID", daemon._id)}
                    />
                    <Button
                      icon="docker"
                      content="Containers"
                      disabled={!daemon.docker}
                      as={Link}
                      to={path.daemonsContainers.replace(
                        ":daemonID",
                        daemon._id
                      )}
                    />
                    <Button
                      icon="terminal"
                      content="SSH"
                      disabled={!daemon.ssh}
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

  private getDockerStatus = (status: dockerStatus) : SemanticShorthandItem<IconProps> => {
    switch (status) {
      case "OK":
        return <Icon color="green" name="check circle" title="Daemon is working well" />
      case "CERT":
        return <Icon color="yellow" name="check circle outline" title="Daemon certs will be soon outdated" />
      case "":
        return <Icon color="grey" name="question circle" title="No status" />
      case "OLD":
        return <Icon color="red" name="warning sign" title="Daemon is too old" />
    }
    return <Icon color="red" name="warning sign" title="Daemon is down or there is an error" />
  }

  private filterAddSearchField = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    this.setState({ searchField: value as string });
  };

  private filterAddTags = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    { value }: ButtonProps
  ) => {
    const { tagsFilter } = this.state;
    const index = tagsFilter.indexOf(value);
    index === -1 ? tagsFilter.push(value) : tagsFilter.splice(index, 1);
    this.setState({ tagsFilter });
  };

  private filterAddStatus = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    { value }: ButtonProps
  ) => {
    const { statusFilter } = this.state;
    const index = statusFilter.indexOf(value);
    index === -1 ? statusFilter.push(value) : statusFilter.splice(index, 1);
    this.setState({ statusFilter });
  };
}

export default Daemons;
