import * as React from "react";
import { Loader, Table, Button } from "semantic-ui-react";

import { IGroup, IContainer, IPort } from "../types/group";
import { fetchContainers } from "../actions/group";

import Layout from "../../layout/layout";
import { IDaemon } from "../../Daemon/types/daemon";

interface IGroupProps {
  group: IGroup;
  daemon: IDaemon;
}

interface IGroupStates {
  containers: IContainer[];
  isFetching: boolean;
  error: Error | null;
}

class GroupContainers extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    containers: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { group } = this.props;

    fetchContainers(group._id)
      .then((containers: IContainer[]) => this.setState({ containers }))
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { daemon, group } = this.props;
    const { containers, error, isFetching } = this.state;

    if (!containers) {
      return (
        <Layout>
          <h2>Group</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }

    if (error) {
      return (
        <Layout>
          <h2>Group</h2>
          <p>{error}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Group</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h2>Group</h2>
        <h3>Containers</h3>
        <Table celled={true} padded={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell singleLine={true}>containerID</Table.HeaderCell>
              <Table.HeaderCell>Service</Table.HeaderCell>
              <Table.HeaderCell>Daemon</Table.HeaderCell>
              <Table.HeaderCell>Links</Table.HeaderCell>
              <Table.HeaderCell>Utils</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {containers.map((container: IContainer) => (
              <Table.Row key={container.Id}>
                <Table.Cell singleLine={true}>{container.Id}</Table.Cell>
                <Table.Cell>toto</Table.Cell>
                <Table.Cell>
                  {container.Ports.map((port: IPort) => (
                    <p key={port.PublicPort}>{port.PublicPort}</p>
                  ))}
                </Table.Cell>
                <Table.Cell>
                  <Button>Click Here</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <p>{JSON.stringify(group)}</p>
        <p>{JSON.stringify(daemon)}</p>
      </Layout>
    );
  }
}

export default GroupContainers;
