import * as React from 'react';
import { Button, Grid, Icon, List, Modal, Search, SearchProps, Table } from 'semantic-ui-react';

import { status } from '../../constants/container';
import { copy } from '../../utils/clipboard';
import { IContainer, IDaemon, IPort } from '../Daemon/types/daemon';
import { IGroup } from '../Group/types/group';
import CmdSocket from './CmdSocket';
import ContainerLogSocket from './ContainerLogSocket';
import ContainersButtons from './ContainersButtons';

interface ITableProps {
  daemon: IDaemon;
  admin: boolean;
  group?: IGroup;
  containers: IContainer[];
}

interface ITableStates {
  searchFilter: string;
}

export default class ContainerTable extends React.Component<ITableProps, ITableStates> {

  public state = {
    searchFilter: ""
  }

  public render() {
    const { daemon, group, admin, containers } = this.props;
    const { searchFilter } = this.state;

    // filter containers
    const containersFiltered = containers && containers.filter(
      c => c.Names.filter(n => n.toLowerCase().includes(searchFilter.toLowerCase())).length > 0
    );

    return (
      <>
        {containersFiltered.length > 0 && (
          <Grid>
            <Grid.Column width={4}>
              <Search
                size="tiny"
                placeholder="Search containers..."
                showNoResults={false}
                onSearchChange={this.filterSearch}
                value={searchFilter}
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
            {containersFiltered
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
                          href={"http://" + daemon.host + ":" + port.PublicPort}
                          target="_blank"
                        >
                          {daemon.host + ":" + port.PublicPort}
                        </List.Item>
                      ))}
                    </List>
                  </Table.Cell>
                  <Table.Cell width={2}>
                    {container.Status || "Removed"}
                  </Table.Cell>
                  <Table.Cell width={3}>
                    <ContainersButtons container={container} daemon={daemon} group={group} />
                  </Table.Cell>
                  <Table.Cell width={5}>
                    <Button
                      icon="clipboard"
                      content="Image"
                      title={container.Image}
                      onClick={copy.bind(this, container.Image)}
                    />
                    {container.Status && <>
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
                            apiURL={`/api${group ? `/groups/${group._id}` : `/daemons/${daemon!._id}`}/docker/containers/${container.Id}/term`}
                          />
                        </Modal.Content>
                      </Modal>
                      </>}
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

  private filterSearch = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    this.setState({ searchFilter: value as string });
  };
}
