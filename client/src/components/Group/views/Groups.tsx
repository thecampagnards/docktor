import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { Button, Grid, Loader, Search, Table } from "semantic-ui-react";

import { IGroup } from "../types/group";
import { fetchGroups } from "../actions/group";

import Layout from "../../layout/layout";
import { path } from "../../../constants/path";
import { SyntheticEvent } from 'react';

interface IGroupsStates {
  groups: IGroup[];
  groupsFiltered: IGroup[];
  isFetching: boolean;
  error: Error | null;
}

class Groups extends React.Component<{}, IGroupsStates> {
  public state = {
    groups: [] as IGroup[],
    groupsFiltered: [] as IGroup[],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    fetchGroups()
      .then((groups: IGroup[]) => this.setState({ groups, groupsFiltered: groups, isFetching: false }))
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { groups, groupsFiltered, error, isFetching } = this.state;

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
          <p>{(error as Error).message}</p>;
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
        <Grid>
          <Grid.Column width={2}>
            <h2>Groups</h2>
          </Grid.Column>
          <Grid.Column width={12}>
            <Search
              size="tiny"
              placeholder="Search groups..."
              showNoResults={false}
              onSearchChange={this.filterGroups}
            />
          </Grid.Column>
          <Grid.Column width={2}>
            <Button primary={true} floated="right" as={Link} to={path.groupsNew}>Create group</Button>
          </Grid.Column>
        </Grid>
        <Button>Project 1</Button><Button>Project 2</Button>
        <Table sortable={true} celled={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Tools</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {groupsFiltered.map((group: IGroup) => (
              <Table.Row key={group._id}>
                <Table.Cell>{group.Name}</Table.Cell>
                <Table.Cell>
                  <ReactMarkdown source={group.Description} />
                </Table.Cell>
                <Table.Cell>
                  <Button.Group>
                    <Button
                      icon="edit"
                      content="Edit"
                      as={Link}
                      to={path.groupsEdit.replace(":groupID", group._id)}
                    />
                    <Button
                      icon="docker"
                      content="Containers"
                      as={Link}
                      to={path.groupsContainers.replace(":groupID", group._id)}
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

  private filterGroups = (event: SyntheticEvent, { value }: any) => {
    this.setState({groupsFiltered : this.state.groups.filter(group => group.Name.includes(value))})
  }
}

export default Groups;
