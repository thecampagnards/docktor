import * as React from "react";
import { Table, List, Button, Modal } from "semantic-ui-react";

import ContainerSocket from "./ContainerSocket";
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
          {containers.map((container: IContainer) => (
            <Table.Row key={container.Id}>
              <Table.Cell singleLine={true}>
                {container.Id.substring(0, 12)} {container.Names}
              </Table.Cell>
              <Table.Cell>
                <List>
                  {container.Ports.map((port: IPort) => (
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
                  >
                    Stop
                  </Button>
                  <Button.Or />
                  <Button
                    color="red"
                    disabled={status.Removed.indexOf(container.State) > -1}
                  >
                    Remove
                  </Button>
                  <Button.Or />
                  <Button
                    color="green"
                    disabled={status.Started.indexOf(container.State) > -1}
                  >
                    Start
                  </Button>
                </Button.Group>
                <Modal trigger={<Button>Get Logs</Button>}>
                  <Modal.Content>
                    <ContainerSocket
                      daemon={daemon}
                      containerID={container.Id}
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
