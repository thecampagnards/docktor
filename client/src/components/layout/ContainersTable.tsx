import * as React from "react";
import { Table, List, Button, Modal } from "semantic-ui-react";

import ContainerLogSocket from "./ContainerLogSocket";
import CmdSocket from "./CmdSocket";

import { changeContainersStatus } from "../Daemon/actions/daemon";

import { status } from "../../constants/container";

import { IContainer, IPort } from "../Group/types/group";
import { IDaemon } from "../Daemon/types/daemon";

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
          {containers
            .sort((a, b) =>
              a.Created > b.Created ? 1 : b.Created > a.Created ? -1 : 0
            )
            .map((container: IContainer) => (
              <Table.Row key={container.Id}>
                <Table.Cell singleLine={true}>
                  {container.Id.substring(0, 12)}<br/>{container.Names}
                </Table.Cell>
                <Table.Cell>
                  <List>
                    {container.Ports.filter(port => port.PublicPort && port.IP === "0.0.0.0").map(
                      (port: IPort) => (
                        <List.Item
                          key={port.PublicPort}
                          as="a"
                          href={"http://" + daemon.Host + ":" + port.PublicPort}
                          target="_blank"
                        >
                          {daemon.Host + ":" + port.PublicPort}
                        </List.Item>
                      )
                    )}
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
                  <Modal trigger={<Button>Get Logs</Button>}>
                    <Modal.Content>
                      <ContainerLogSocket
                        daemon={daemon}
                        containerID={container.Id}
                      />
                    </Modal.Content>
                  </Modal>
                  <Modal trigger={<Button disabled={status.Started.indexOf(container.State) < -1}>Exec commands</Button>} size="large" >
                    <Modal.Content style={{ background: "black" }}>
                      <CmdSocket
                        apiURL={`/api/daemons/${daemon._id}/commands/${container.Id}`}
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
