import * as React from "react";
import { Loader, Table, Button } from "semantic-ui-react";

import { IGroup, IContainer, IPort } from "../types/group";
import { fetchContainers } from "../actions/group";

import { IDaemon } from "../../Daemon/types/daemon";
import Socket from "src/components/layout/Socket";

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
    const { daemon } = this.props;
    const { containers, error, isFetching } = this.state;

    if (!containers) {
      return <p>No data yet ...</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <>
        <Table celled={true} padded={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell singleLine={true}>containerID</Table.HeaderCell>
              <Table.HeaderCell>Service</Table.HeaderCell>
              <Table.HeaderCell>Ports</Table.HeaderCell>
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
                  <Button>Get Logs</Button>
                  <Socket daemon={daemon} containerID={container.Id} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </>
    );
  }
}

export default GroupContainers;
