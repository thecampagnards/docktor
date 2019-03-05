import * as React from "react";

import { Link } from "react-router-dom";
import { Button, Grid, Loader, Table, Search } from "semantic-ui-react";

import { IDaemon } from "../types/daemon";
import { fetchDaemons } from "../actions/daemon";

import Layout from "../../layout/layout";
import { path } from "../../../constants/path";
import './Daemons.css'
import { SyntheticEvent } from 'react';

interface IDaemonsStates {
  daemons: IDaemon[];
  daemonsFiltered: IDaemon[];
  isFetching: boolean;
  error: Error | null;
}

class Daemons extends React.Component<{}, IDaemonsStates> {
  public state = {
    daemons: [] as IDaemon[],
    daemonsFiltered: [] as IDaemon[],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    fetchDaemons()
      .then((daemons: IDaemon[]) =>
        this.setState({ daemons, daemonsFiltered: daemons, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { daemons, daemonsFiltered, error, isFetching } = this.state;

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

    return (
      <Layout>
        <Grid>
          <Grid.Column width={2}>
            <h2>Daemons</h2>
          </Grid.Column>
          <Grid.Column width={12}>
            <Search
              size="tiny"
              placeholder="Search daemons..."
              showNoResults={false}
              onSearchChange={this.filterDaemons}
            />
          </Grid.Column>
          <Grid.Column width={2}>
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
            {daemonsFiltered.map((daemon: IDaemon) => (
              <Table.Row key={daemon._id}>
                <Table.Cell>{daemon.Name}</Table.Cell>
                <Table.Cell>{daemon.Host}</Table.Cell>
                <Table.Cell>
                  <Button.Group>
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

  private filterDaemons = (event: SyntheticEvent, { value }: any) => {
    this.setState({daemonsFiltered : this.state.daemons.filter(daemon => daemon.Name.includes(value))})
  }
}

export default Daemons;
