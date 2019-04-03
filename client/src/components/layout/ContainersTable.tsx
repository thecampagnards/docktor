import * as React from 'react';
import { Button, Grid, Icon, List, Modal, Search, SearchProps, Table } from 'semantic-ui-react';

import { status } from '../../constants/container';
import { changeContainersStatus } from '../Daemon/actions/daemon';
import { IContainer, IDaemon, IPort } from '../Daemon/types/daemon';
import { createContainer } from '../Group/actions/group';
import { IGroup } from '../Group/types/group';
import CmdSocket from './CmdSocket';
import ContainerLogSocket from './ContainerLogSocket';
import { copy } from '../../utils/clipboard';

interface ITableProps {
  daemon: IDaemon;
  admin: boolean;
  group?: IGroup;
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
    this.setState({ containersFiltered: this.props.containers })
  }

  public render() {
    const { daemon, group, admin } = this.props;
    const { containersFiltered } = this.state;
    return (
      <>
        {containersFiltered && containersFiltered.length > 0 && (
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
        )}
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
                      {container.Names || container.Name}
                    </Table.Cell>
                    <Table.Cell width={3}>
                      <List>
                        {container.Ports && container.Ports.filter(
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
                      {container.Status || "Removed"}
                    </Table.Cell>
                    <Table.Cell width={3}>
                      {container.Status ?
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
                        :
                        <Button
                          icon={true}
                          color="green"
                          disabled={status.Started.indexOf(container.State) > -1}
                          onClick={createContainer.bind(
                            this,
                            group!._id,
                            container.Id
                          )}
                        >
                          <Icon name="cog" /> CREATE
                        </Button>
                      }
                    </Table.Cell>
                    <Table.Cell width={5}>
                      {container.Status && <>
                        <Button
                          icon="clipboard"
                          content="Image"
                          title={container.Image}
                          onClick={copy.bind(this, container.Image)}
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
                              disabled={!admin || !status.Started.includes(container.State)}
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
                      </>}
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

}
