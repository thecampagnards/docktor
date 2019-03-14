import * as React from "react";
import * as _ from 'lodash';

import { Link } from "react-router-dom";
import { Button, Grid, Loader, Table, Search, SearchProps, ButtonProps } from "semantic-ui-react";

import { IDaemon } from "../types/daemon";
import { fetchDaemons } from "../actions/daemon";

import Layout from "../../layout/layout";
import { path } from "../../../constants/path";
import './Daemons.css'

interface IDaemonsStates {
  daemons: IDaemon[];
  daemonsFiltered: IDaemon[];
  tagsFilter: string[];
  isFetching: boolean;
  error: Error | null;
}

class Daemons extends React.Component<{}, IDaemonsStates> {
  public state = {
    daemons: [] as IDaemon[],
    daemonsFiltered: [] as IDaemon[],
    tagsFilter: [] as string[],
    isFetching: false,
    error: null
  };

  private searchField = ""

  public componentWillMount() {
    fetchDaemons()
      .then((daemons: IDaemon[]) =>
        this.setState({ daemons, daemonsFiltered: daemons, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { daemons, daemonsFiltered, tagsFilter, error, isFetching } = this.state;

    if (!daemons) {
      return (
        <Layout>
          <h2>Daemons</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }

    if (error) {
      return (
        <Layout>
          <h2>Daemons</h2>
          <p>{(error as Error).message}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Daemons</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    let tags: string[] = []
    for (const d of daemons) {
      tags = _.union(tags, d.Tags)
    }

    return (
      <Layout>
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
            {tags.map(tag =>
              <Button key={tag} compact={true} toggle={true} active={tagsFilter.indexOf(tag) > -1} onClick={this.filterAddTags} value={tag}>{tag}</Button>
            )}
          </Grid.Column>
          <Grid.Column width={3}>
            <Button primary={true} floated="right" as={Link} to={path.daemonsNew}>Add daemon</Button>
          </Grid.Column>
        </Grid>
        <Table celled={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Host</Table.HeaderCell>
              <Table.HeaderCell>Tools</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {daemonsFiltered.slice(0, 20).map((daemon: IDaemon) => (
              <Table.Row key={daemon._id}>
                <Table.Cell>{daemon.Name}</Table.Cell>
                <Table.Cell>{daemon.Host}</Table.Cell>
                <Table.Cell>
                  <Button.Group fluid={true}>
                    <Button
                      icon="chart area"
                      content="CAdvisor"
                      disabled={!daemon.CAdvisor}
                      href={daemon.CAdvisor}
                    />
                    <Button
                      icon="docker"
                      content="Containers"
                      disabled={!daemon.Host}
                      as={Link}
                      to={path.daemonsContainers.replace(":daemonID", daemon._id)}
                    />
                    <Button
                      icon="terminal"
                      content="SSH"
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
      </Layout>
    );
  }

  private filter = () => {
    const { tagsFilter } = this.state

    let daemonsFiltered = this.state.daemons.filter(daemons => daemons.Name.toLowerCase().includes(this.searchField.toLowerCase()))
    if (tagsFilter.length > 0) {
      daemonsFiltered = daemonsFiltered.filter(d => _.intersectionWith(d.Tags, tagsFilter, _.isEqual).length !== 0)
    }
    this.setState({ daemonsFiltered })
  }

  private filterAddSearchField = (event: React.SyntheticEvent, { value }: SearchProps) => {
    this.searchField = value as string
    this.filter()
  }

  private filterAddTags = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, { value }: ButtonProps) => {
    const { tagsFilter } = this.state
    const index = tagsFilter.indexOf(value)
    index === -1 ? tagsFilter.push(value) : tagsFilter.splice(index, 1)
    this.setState({ tagsFilter })
    this.filter()
  }
}

export default Daemons;
