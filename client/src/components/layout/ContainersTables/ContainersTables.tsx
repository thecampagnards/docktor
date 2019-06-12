import * as React from "react";
import {
  Button,
  Grid,
  Icon,
  Modal,
  Popup,
  Search,
  SearchProps,
  Table,
  Label
} from "semantic-ui-react";

import { status } from "../../../constants/container";
import { copy } from "../../../utils/clipboard";
import { changeContainersStatus } from "../../Daemon/actions/daemon";
import { IContainer, IDaemon } from "../../Daemon/types/daemon";
import { fetchImages } from "../../Images/actions/image";
import { IImage } from "../../Images/types/image";
import ShellSocket from "../ShellSocket";
import TextSocket from "../TextSocket";
import ButtonsStatus from "./ButtonsStatus";
import Commands from "./Commands";

interface ITableProps {
  daemon: IDaemon;
  admin: boolean;
  containers: IContainer[];
}

interface ITableStates {
  images: IImage[];

  searchFilter: string;
  isFetching: boolean;
  error: Error;
}

export default class ContainerTable extends React.Component<
  ITableProps,
  ITableStates
> {
  public state = {
    images: [] as IImage[],

    searchFilter: "",
    isFetching: false,
    error: Error()
  };

  public componentWillMount() {
    fetchImages().then(images => this.setState({ images }));
  }

  public render() {
    const { daemon, admin, containers } = this.props;
    const { isFetching, error, images, searchFilter } = this.state;

    // filter containers
    let containersFiltered =
      containers &&
      containers.filter(
        c =>
          c.Names && c.Names.filter(n =>
            n.toLowerCase().includes(searchFilter.toLowerCase())
          ).length > 0
      );

    containersFiltered = containersFiltered.sort((a, b) =>
      a.Created > b.Created ? 1 : b.Created > a.Created ? -1 : 0
    );

    return (
      <>
        {containers.length > 0 && (
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
              <Popup
                content={error.message}
                disabled={!error.message}
                inverted={true}
                trigger={
                  <Button.Group fluid={true}>
                    <Button
                      color="orange"
                      icon={true}
                      floated="right"
                      loading={isFetching}
                      onClick={this.handleAllOnClick.bind(this, "stop")}
                    >
                      <Icon name="stop" /> STOP ALL
                    </Button>
                    <Button
                      color="green"
                      icon={true}
                      floated="right"
                      loading={isFetching}
                      onClick={this.handleAllOnClick.bind(this, "start")}
                    >
                      <Icon name="play" /> START ALL
                    </Button>
                  </Button.Group>
                }
              />
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
            {containersFiltered.map(container => (
              <Table.Row key={container.Id}>
                <Table.Cell singleLine={true}>
                  {container.Id.substring(0, 12)}
                  <br />
                  {container.Names || container.Name}
                </Table.Cell>
                <Table.Cell>
                    {daemon.host &&
                      container.Ports &&
                      container.Ports.filter(
                        port => port.PublicPort && port.IP === "0.0.0.0"
                      ).sort((a, b) => a.PrivatePort - b.PrivatePort).map(port => (
                        <Label
                        content={port.PrivatePort}
                          as="a"
                          href={"http://" + daemon.host + ":" + port.PublicPort}
                          target="_blank"
                        />
                      ))}
                </Table.Cell>
                <Table.Cell>
                  {container.Status || "Removed"}
                </Table.Cell>
                <Table.Cell>
                  <ButtonsStatus container={container} daemon={daemon} />
                </Table.Cell>
                <Table.Cell>
                  <Button.Group fluid={true}>
                  <Button
                    icon="clipboard"
                    content="Image"
                    title={container.Image}
                    onClick={copy.bind(this, container.Image)}
                  />
                  {container.Status && (
                    <>
                      <Modal
                        trigger={<Button icon="align left" content="Logs" />}
                      >
                        <Modal.Content
                          style={{ background: "black", color: "white" }}
                        >
                          <pre style={{ whiteSpace: "pre-line" }}>
                            <TextSocket
                              wsPath={`/api/daemons/${
                                daemon._id
                              }/docker/containers/${container.Id}/log`}
                            />
                          </pre>
                        </Modal.Content>
                      </Modal>
                      <Modal
                        trigger={
                          <Button
                            disabled={
                              !admin ||
                              !status.Started.includes(container.State) ||
                              !this.allowShell(container)
                            }
                            icon="terminal"
                            content="Exec"
                          />
                        }
                        size="large"
                      >
                        <Modal.Content style={{ background: "black" }}>
                          <ShellSocket
                            wsPath={`/api/daemons/${
                              daemon._id
                            }/docker/containers/${container.Id}/term`}
                          />
                        </Modal.Content>
                      </Modal>
                      <Modal
                        trigger={
                          <Button
                            disabled={!status.Started.includes(container.State)}
                            icon="forward"
                            content=" Commands"
                          />
                        }
                        size="tiny"
                      >
                        <Modal.Header>
                          {container.Names + " available commands :"}
                        </Modal.Header>
                        <Modal.Content>
                          <Commands
                            images={images.filter(i =>
                              RegExp(i.image.Pattern).test(container.Image)
                            )}
                            daemon={daemon}
                            container={container}
                          />
                        </Modal.Content>
                      </Modal>
                    </>
                  )}
                  <Modal trigger={<Button icon="search" content="Inspect" />}>
                    <Modal.Content
                      style={{ background: "black", color: "white" }}
                    >
                      <pre>{JSON.stringify(container, null, 2)}</pre>
                    </Modal.Content>
                  </Modal>
                  </Button.Group>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </>
    );
  }

  private handleAllOnClick = (state: string) => {
    const { containers, daemon } = this.props;

    this.setState({ isFetching: true });
    changeContainersStatus(daemon._id, state, containers.map(c => c.Id))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };

  private allowShell = (container: IContainer): boolean => {
    const { admin } = this.props;
    if (admin) {
      return true;
    }

    const { images } = this.state;

    for (const image of images) {
      if (
        RegExp(image.image.Pattern).test(container.Image) &&
        image.is_allow_shell
      ) {
        return true;
      }
    }
    return false;
  };

  private filterSearch = (_: React.SyntheticEvent, { value }: SearchProps) => {
    this.setState({ searchFilter: value as string });
  };
}
