import * as React from 'react';
import { Button, Grid, Icon, List, Modal, Search, SearchProps, Table } from 'semantic-ui-react';

import { status } from '../../constants/container';
import { changeContainersStatus } from '../Daemon/actions/daemon';
import { IContainer, IDaemon, IPort } from '../Daemon/types/daemon';
import CmdSocket from './CmdSocket';
import ContainerLogSocket from './ContainerLogSocket';

interface ITableProps {
  daemon: IDaemon;
  containers: IContainer[];
}

interface ITableStates {
  containersFiltered: IContainer[];
}

export default class ContainerTable extends React.Component<ITableProps, ITableStates> {

  public state = {
    containersFiltered: [] as IContainer[]
  }
  private searchFilter: string = "";

  public componentWillMount() {
    this.setState({containersFiltered: this.props.containers})
  }

  public render() {
    const { daemon } = this.props;
    const { containersFiltered } = this.state;
    return (
      <>
      <Grid>
        <Grid.Column width={4}>
          <Search
            size="tiny"
            placeholder="Search containers..."
            showNoResults={false}
            onSearchChange={this.filterSearch}
          />
        </Grid.Column>
        <Grid.Column width={8} />
        <Grid.Column width={4}>
          <Button color="orange" icon={true} floated="right">
            <Icon name="stop" /> STOP ALL
          </Button>
          <Button color="green" icon={true} floated="right">
            <Icon name="play" /> START ALL
          </Button>
        </Grid.Column>
      </Grid>
      <Table celled={true} padded={true}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell singleLine={true}>Container</Table.HeaderCell>
            <Table.HeaderCell>Links</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Commands</Table.HeaderCell>
            <Table.HeaderCell>Options</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {containersFiltered &&
            containersFiltered
              .sort((a, b) =>
                a.Created > b.Created ? 1 : b.Created > a.Created ? -1 : 0
              )
              .map((container: IContainer) => (
                <Table.Row key={container.Id}>
                  <Table.Cell width={3} singleLine={true}>
                    {container.Id.substring(0, 12)}
                    <br />
                    {container.Names}
                  </Table.Cell>
                  <Table.Cell width={3}>
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
                  <Table.Cell width={2}>
                    {container.Status}
                  </Table.Cell>
                  <Table.Cell width={3}>
                    <Button.Group fluid={true}>
                      <Button
                        icon={true}
                        color="green"
                        disabled={status.Started.indexOf(container.State) > -1}
                        onClick={changeContainersStatus.bind(
                          this,
                          daemon._id,
                          "start",
                          [container.Id]
                        )}
                      >
                        <Icon name="play" /> START
                      </Button>
                      <Button
                        icon={true}
                        color="orange"
                        disabled={status.Stopped.indexOf(container.State) > -1}
                        onClick={changeContainersStatus.bind(
                          this,
                          daemon._id,
                          "stop",
                          [container.Id]
                        )}
                      >
                        <Icon name="stop" /> STOP
                      </Button>
                      <Button
                        icon={true}
                        color="red"
                        disabled={status.Removed.indexOf(container.State) > -1}
                        onClick={changeContainersStatus.bind(
                          this,
                          daemon._id,
                          "remove",
                          [container.Id]
                        )}
                      >
                        <Icon name="delete" /> DELETE
                      </Button>
                    </Button.Group>
                  </Table.Cell>
                  <Table.Cell width={5}>
                    <Button
                      icon="clipboard"
                      content="Image"
                      title={container.Image}
                      onClick={this.copyImage.bind(this, container.Image)}
                    />
                    <Modal trigger={<Button icon="align left" content="Logs" />}>
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
                          content="Exec"
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
                    <Modal trigger={<Button icon="search" content="Inspect" />}>
                      <Modal.Content
                        style={{ background: "black", color: "white" }}
                      >
                        <pre>
                          {JSON.stringify(container, null, 2)}
                        </pre>
                      </Modal.Content>
                    </Modal>
                  </Table.Cell>
                </Table.Row>
              ))}
        </Table.Body>
      </Table>
      </>
    );
  }

  private filterContainers = () => {
    const containersFiltered = this.props.containers.filter(
      c => c.Names.filter(
        n => n.toLowerCase().includes(this.searchFilter.toLowerCase())
      ).length > 0
    );
    this.setState({ containersFiltered });
  };

  private filterSearch = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    this.searchFilter = value as string;
    this.filterContainers();
  };

  private copyImage = (value: string) => {

    const f = (e: ClipboardEvent) => {
      e.clipboardData!.setData("text/plain", value);
      e.preventDefault();
      document.removeEventListener("copy", f)
    };

    document.addEventListener("copy", f)
    document.execCommand("copy");
  };

}
