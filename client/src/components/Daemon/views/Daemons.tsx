import * as _ from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Button, ButtonProps, Grid, Icon, IconProps, Label, Loader, Message, Search, SearchProps,
    SemanticShorthandItem, Table
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { fetchDaemons } from '../actions/daemon';
import { dockerStatus, IDaemon } from '../types/daemon';

interface IDaemonsStates {
  daemons: IDaemon[];
  isFetching: boolean;
  error: Error;
  index: number;

  filter: {
    tags: string[];
    status: dockerStatus[];
    search: string;
  };
}

class Daemons extends React.Component<{}, IDaemonsStates> {
  public state = {
    daemons: [] as IDaemon[],
    isFetching: false,
    error: Error(),
    index: 0,

    filter: {
      tags: [] as string[],
      status: [] as dockerStatus[],
      search: ""
    }
  };

  public componentDidMount() {
    const localFilters = localStorage.getItem("daemonFilters");
    if (localFilters) {
      this.setState({ filter: JSON.parse(localFilters) });
    }

    fetchDaemons()
      .then(daemons => {
        this.setState({ daemons });
      })
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public componentWillUpdate(nextProps: {}, nextState: IDaemonsStates) {
    localStorage.setItem("daemonFilters", JSON.stringify(nextState.filter));
  }

  public render() {
    const { daemons, error, isFetching, index, filter } = this.state;

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
      daemon.name.toLowerCase().includes(filter.search.toLowerCase())
    );

    // filter by tags
    if (filter.tags.length > 0) {
      daemonsFiltered = daemonsFiltered.filter(
        d => _.intersectionWith(d.tags, filter.tags, _.isEqual).length !== 0
      );
    }

    // filter by status
    if (filter.status.length > 0) {
      daemonsFiltered = daemonsFiltered.filter(d =>
        filter.status.includes(d.docker.status)
      );
    }

    // Pagination
    const resultsTotal = daemonsFiltered.length;
    const resultsDisplayTop = index * 20;
    const resultsDisplayBot = Math.min(resultsDisplayTop + 20, resultsTotal);
    const indexLimit = Math.trunc((resultsTotal - 1) / 20);
    const labelText =
      resultsTotal === 0
        ? "No result"
        : `Results ${resultsDisplayTop +
            1} to ${resultsDisplayBot} of ${resultsTotal}`;
    daemonsFiltered = daemonsFiltered.slice(
      resultsDisplayTop,
      resultsDisplayBot
    );

    let tags: string[] = [];
    for (const d of daemons) {
      tags = _.union(tags, d.tags);
    }

    return (
      <>
        <Grid>
          <Grid.Row>
            <Grid.Column width={2}>
              <h2>Daemons</h2>
            </Grid.Column>
            <Grid.Column width={4}>
              <Search
                size="tiny"
                placeholder="Search daemons..."
                value={filter.search}
                showNoResults={false}
                onSearchChange={this.filterAddSearchField}
              />
            </Grid.Column>
            <Grid.Column width={3}>
              {["OK", "CERT", "DOWN", "OLD", ""].map(status => {
                return (
                  <Button
                    compact={true}
                    icon={true}
                    key={status}
                    toggle={true}
                    onClick={this.filterAddStatus}
                    value={status}
                    color={
                      filter.status.includes(status as dockerStatus)
                        ? "grey"
                        : undefined
                    }
                  >
                    {this.getDockerStatus(status as dockerStatus)}
                  </Button>
                );
              })}
            </Grid.Column>
            <Grid.Column width={3} floated="right">
              <Button
                primary={true}
                floated="right"
                as={Link}
                to={path.daemonsNew}
                labelPosition="left"
                icon="plus"
                content="Add daemon"
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              {tags.map(tag => (
                <Button
                  key={tag}
                  basic={true}
                  compact={true}
                  toggle={true}
                  active={filter.tags.indexOf(tag) > -1}
                  onClick={this.filterAddTags}
                  value={tag}
                >
                  {tag}
                </Button>
              ))}
            </Grid.Column>
          </Grid.Row>
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
        <Grid>
          <Grid.Column width={6}>
            <Label>{labelText}</Label>
          </Grid.Column>
          <Grid.Column width={4}>
            <Button.Group compact={true} fluid={true}>
              <Button
                icon="chevron left"
                disabled={index === 0}
                onClick={this.prevPage}
              />
              <Button disabled={true} content={`Page ${index + 1}`} />
              <Button
                icon="chevron right"
                disabled={index === indexLimit}
                onClick={this.nextPage}
              />
            </Button.Group>
          </Grid.Column>
          <Grid.Column width={6} />
        </Grid>
      </>
    );
  }

  private getDockerStatus = (
    status: dockerStatus
  ): SemanticShorthandItem<IconProps> => {
    switch (status) {
      case "OK":
        return (
          <Icon
            color="green"
            name="check circle"
            title="Daemon is up and running"
          />
        );
      case "CERT":
        return (
          <Icon
            color="yellow"
            name="check circle outline"
            title="Daemon certs are or will be outdated soon"
          />
        );
      case "OLD":
        return (
          <Icon
            color="orange"
            name="warning sign"
            title="Daemon's Docker version < 18"
          />
        );
      case "":
        return (
          <Icon color="black" name="question circle" title="No status info" />
        );
      default:
        return (
          <Icon color="red" name="close" title="Daemon is down/unreachable" />
        );
    }
  };

  private filterAddSearchField = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    const { filter } = this.state;
    filter.search = value as string;
    this.setState({ filter });
  };

  private filterAddTags = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    { value }: ButtonProps
  ) => {
    const { filter } = this.state;
    const index = filter.tags.indexOf(value);
    index === -1 ? filter.tags.push(value) : filter.tags.splice(index, 1);
    this.setState({ filter });
  };

  private filterAddStatus = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    { value }: ButtonProps
  ) => {
    const { filter } = this.state;
    const index = filter.status.indexOf(value);
    index === -1 ? filter.status.push(value) : filter.status.splice(index, 1);
    this.setState({ filter });
  };

  private prevPage = () => {
    let { index } = this.state;
    index--;
    this.setState({ index });
  };

  private nextPage = () => {
    let { index } = this.state;
    index++;
    this.setState({ index });
  };
}

export default Daemons;
