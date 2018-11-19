import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Loader, Table } from "semantic-ui-react";

import { IStoreState } from "../../types/store";
import Layout from "../../components/layout/layout";
import { IDaemon } from "../../types/model";
import { fetchDaemonsThunk } from "../../actions/daemons";
import { path } from "../../constants/path";

interface IDaemonsProps {
  daemons: IDaemon[];
  isFetching: boolean;
  fetchDaemons: () => void;
}

type ASCENDING = "ascending";
type DESCENDING = "descending";

type SortType = ASCENDING | DESCENDING;

const Ascending: ASCENDING = "ascending";

const Descending: DESCENDING = "descending";

interface IDaemonsStates {
  column: string | null;
  direction: SortType;
}

class Daemons extends React.Component<IDaemonsProps, IDaemonsStates> {
  public state = {
    column: null,
    direction: Ascending
  };

  public componentWillMount() {
    this.props.fetchDaemons();
  }

  public render() {
    const { daemons, isFetching } = this.props;

    const { column, direction } = this.state;

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
            {daemons.map(daemon => (
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
                      to={path.daemonsEdit + "/" + daemon._id}
                    />
                    <Button
                      icon="cog"
                      content="More"
                      as={Link}
                      to={path.daemonsMore + "/" + daemon._id}
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
    const { daemons } = this.props;

    const { column, direction } = this.state;

    if (column !== clickedColumn) {
      daemons.sort();
      this.setState({
        column: clickedColumn,
        direction: Descending
      });
      return;
    }

    daemons.reverse();
    this.setState({
      direction: direction === Ascending ? Descending : Ascending
    });
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { daemons } = state;
  return {
    daemons: daemons.daemons || [],
    isFetching: !!daemons.isFetching
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IStoreState>) => {
  return {
    fetchDaemons: () => {
      dispatch(fetchDaemonsThunk());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Daemons);
