import * as React from "react";
import * as _ from "lodash";

import { Link } from "react-router-dom";
import { Button, Loader, Table } from "semantic-ui-react";

import { IDaemon } from "../types/daemon";
import { fetchDaemons } from "../actions/daemon";

import Layout from "../../layout/layout";
import { path } from "../../../constants/path";

type ASCENDING = "ascending";
type DESCENDING = "descending";

type SortType = ASCENDING | DESCENDING;

const Ascending: ASCENDING = "ascending";

const Descending: DESCENDING = "descending";

interface IDaemonsStates {
  daemons: IDaemon[];
  isFetching: boolean;
  error: Error | null;

  column: string | null;
  direction: SortType;
}

class Daemons extends React.Component<{}, IDaemonsStates> {
  public state = {
    column: null,
    direction: Ascending,

    daemons: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    fetchDaemons()
      .then((daemons: IDaemon[]) =>
        this.setState({ daemons, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { column, direction, daemons, error, isFetching } = this.state;

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
          <p>{error}</p>;
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
        <h2>Daemons</h2>
        <Table sortable={true} celled={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sorted={column === "name" ? direction : Ascending}
                onClick={this.handleSort("name")}
              >
                Name
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "host" ? direction : Ascending}
                onClick={this.handleSort("host")}
              >
                Host
              </Table.HeaderCell>
              <Table.HeaderCell>Tools</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {daemons.map((daemon: IDaemon) => (
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

  private handleSort = (clickedColumn: string) => () => {
    const { column, daemons, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        daemons: _.sortBy(daemons, [clickedColumn]),
        direction: Ascending
      });

      return;
    }

    this.setState({
      daemons: daemons.reverse(),
      direction: direction === Ascending ? Descending : Ascending
    });
  };
}

export default Daemons;
