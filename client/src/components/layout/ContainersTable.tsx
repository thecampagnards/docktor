import * as React from 'react';
import { Button, List, Modal, Table } from 'semantic-ui-react';

import { status } from '../../constants/container';
import { changeContainersStatus } from '../Daemon/actions/daemon';
import { IContainer, IDaemon, IPort } from '../Daemon/types/daemon';
import CmdSocket from './CmdSocket';
import ContainerLogSocket from './ContainerLogSocket';

interface ITableProps {
  daemon: IDaemon;
  containers: IContainer[];
}

export default class ContainerTable extends React.Component<ITableProps> {
  public render() {
    const { daemon, containers } = this.props;
    return (
      <Table celled={true} padded={true}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell singleLine={true}>Container</Table.HeaderCell>
            <Table.HeaderCell>Links</Table.HeaderCell>
            <Table.HeaderCell>Image</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Utils</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {containers &&
            containers
              .sort((a, b) =>
                a.Created > b.Created ? 1 : b.Created > a.Created ? -1 : 0
              )
              .map((container: IContainer) => (
                <Table.Row key={container.Id}>
                  <Table.Cell singleLine={true}>
                    {container.Id.substring(0, 12)}
                    <br />
                    {container.Names}
                  </Table.Cell>
                  <Table.Cell>
                    <List>
                      {container.Ports.filter(
                        port => port.PublicPort && port.IP === "0.0.0.0"
                      ).map((port: IPort) => (
                        <List.Item
                          key={port.PublicPort}
                          as="a"
                          href={"http://" + daemon.Host + ":" + port.PublicPort}
                          target="_blank"
                        >
                          {daemon.Host + ":" + port.PublicPort}
                        </List.Item>
                      ))}
                    </List>
                  </Table.Cell>
                  <Table.Cell>{container.Image}</Table.Cell>
                  <Table.Cell>{container.Status}</Table.Cell>
                  <Table.Cell>
                    <Button.Group>
                      <Button
                        color="orange"
                        disabled={status.Stopped.indexOf(container.State) > -1}
                        onClick={changeContainersStatus.bind(
                          this,
                          daemon._id,
                          "stop",
                          [container.Id]
                        )}
                      >
                        Stop
                      </Button>
                      <Button.Or />
                      <Button
                        color="red"
                        disabled={status.Removed.indexOf(container.State) > -1}
                        onClick={changeContainersStatus.bind(
                          this,
                          daemon._id,
                          "remove",
                          [container.Id]
                        )}
                      >
                        Remove
                      </Button>
                      <Button.Or />
                      <Button
                        color="green"
                        disabled={status.Started.indexOf(container.State) > -1}
                        onClick={changeContainersStatus.bind(
                          this,
                          daemon._id,
                          "start",
                          [container.Id]
                        )}
                      >
                        Start
                      </Button>
                    </Button.Group>
                    <Modal trigger={<Button icon="align left" />}>
                      <Modal.Content
                        style={{ background: "black", color: "white" }}
                      >
                        <pre style={{ whiteSpace: "pre-line" }}>
                          <ContainerLogSocket
                            daemon={daemon}
                            containerID={container.Id}
                          />
                        </pre>
                      </Modal.Content>
                    </Modal>
                    <Modal
                      trigger={
                        <Button
                          disabled={
                            status.Started.indexOf(container.State) < -1
                          }
                          icon="terminal"
                        />
                      }
                      size="large"
                    >
                      <Modal.Content style={{ background: "black" }}>
                        <CmdSocket
                          apiURL={`/api/daemons/${
                            daemon._id
                          }/docker/containers/${container.Id}/term`}
                        />
                      </Modal.Content>
                    </Modal>
                  </Table.Cell>
                </Table.Row>
              ))}
        </Table.Body>
      </Table>
    );
  }
}
