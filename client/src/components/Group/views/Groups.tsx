import * as React from "react";
import * as _ from "lodash";
import { Link } from "react-router-dom";
import { Button, Loader, Table } from "semantic-ui-react";

import { IGroup } from "../types/group";
import { fetchGroups } from '../actions/group';

import Layout from "../../layout/layout";
import { path } from "../../../constants/path";

type ASCENDING = "ascending";
type DESCENDING = "descending";

type SortType = ASCENDING | DESCENDING;

const Ascending: ASCENDING = "ascending";

const Descending: DESCENDING = "descending";

interface IGroupsStates {
  groups: IGroup[];
  isFetching: boolean;
  error: Error | null;

  column: string | null;
  direction: SortType;
}

class Groups extends React.Component<{}, IGroupsStates> {

  public state = {
    column: null,
    direction: Ascending,

    groups: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    fetchGroups()
    .then((groups: IGroup[]) => this.setState({groups, isFetching: false}))
    .catch((error: Error) => this.setState({ error, isFetching: false }))
  }

  public render() {
    const { column, direction, groups, error, isFetching } = this.state;

    if (!groups) {
      return (
        <Layout>
          <h2>Groups</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }
  
    if (error) {
      return (
        <Layout>
          <h2>Groups</h2>
          <p>{error}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Groups</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h2>Groups</h2>
        <Table sortable={true} celled={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sorted={column === "name" ? direction : Ascending}
                onClick={this.handleSort("name")}
              >
                Name
              </Table.HeaderCell>
              <Table.HeaderCell>
                Description
              </Table.HeaderCell>
              <Table.HeaderCell>Tools</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {groups.map((group: IGroup) => (
              <Table.Row key={group._id}>
                <Table.Cell>{group.Name}</Table.Cell>
                <Table.Cell>{group.Description}</Table.Cell>
                <Table.Cell>
                  <Button.Group>
                    <Button
                      icon="edit"
                      content="Edit"
                      as={Link}
                      to={path.groupsEdit.replace(":groupID", group._id)}
                    />
                    <Button
                      icon="cog"
                      content="More"
                      as={Link}
                      to={path.groupsMore.replace(":groupID", group._id)}
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
    const { column, groups, direction } = this.state

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        groups: _.sortBy(groups, [clickedColumn]),
        direction: Ascending,
      })

      return
    }

    this.setState({
      groups: groups.reverse(),
      direction: direction === Ascending ? Descending : Ascending,
    })
  }
}

export default Groups;