import * as React from 'react';
import { Button, Card, Dropdown, Grid, Label, Modal, Popup, Segment } from 'semantic-ui-react';

import { copy } from '../../../utils/clipboard';
import { changeContainersStatus } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon, IPort } from '../../Daemon/types/daemon';
import { saveContainers } from '../../Group/actions/group';
import { IImage } from '../../Images/types/image';
import ShellSocket from '../ShellSocket';
import TextSocket from '../TextSocket';
import Commands from './Commands';

interface IContainerCardProps {
  groupId?: string;
  daemon: IDaemon;
  container: IContainer;
  admin: boolean;
  refresh: () => void;
  images: IImage[];
}

interface IContainerCardState {
  containerName: string;
  containerImage: string;
  containerState: string;
  isFetchingState: boolean;
  updateError: Error;
  saveError: Error;
}

export default class ContainerCard extends React.Component<
  IContainerCardProps,
  IContainerCardState
> {
  public static getDerivedStateFromProps(props: IContainerCardProps) {
    const containerState = props.container.Status
      ? props.container.State
      : "removed";
    const containerName = props.container.Status
      ? props.container.Names[0]
      : props.container.Name;
    const containerImage = props.container.Status
      ? props.container.Image
      : props.container.Config.Image;
    const isFetchingState = false;

    return { containerState, containerName, containerImage, isFetchingState };
  }

  public state = {
    containerName: "",
    containerImage: "",
    containerState: this.props.container.Status
      ? this.props.container.State
      : "removed",
    isFetchingState: false,
    updateError: Error(),
    saveError: Error()
  };

  public render() {
    const { container, daemon, images, admin } = this.props;
    const {
      containerName,
      containerImage,
      containerState,
      isFetchingState,
      updateError
    } = this.state;

    return (
      <Card fluid={true} color={this.getStatusColor(containerState)}>
        <Card.Content>
          <Grid>
            <Grid.Column width={13}>
              <Card.Header>{containerName.toUpperCase()}</Card.Header>
              <Card.Meta>{containerImage}</Card.Meta>
            </Grid.Column>
            <Grid.Column width={3}>{this.containerStatus()}</Grid.Column>
          </Grid>
        </Card.Content>
        <Card.Content>
          <Segment>
            <Button.Group style={{ marginRight: 10 }}>
              {containerState === "running" && (
                <>
                  <Button
                    basic={true}
                    color="green"
                    icon="redo"
                    title="Restart"
                    loading={isFetchingState}
                    onClick={this.handleStatusButton.bind(this, "restart")}
                  />
                  <Button
                    basic={true}
                    color="orange"
                    icon="stop"
                    title="Stop"
                    loading={isFetchingState}
                    onClick={this.handleStatusButton.bind(this, "stop")}
                  />
                </>
              )}
              {containerState === "exited" && (
                <Button
                  basic={true}
                  color="green"
                  icon="play"
                  title="Start"
                  loading={isFetchingState}
                  onClick={this.handleStatusButton.bind(this, "start")}
                />
              )}
              {container.Status ? (
                <Popup
                  trigger={
                    <Button
                      basic={true}
                      color="red"
                      icon="delete"
                      title="Delete"
                      loading={isFetchingState}
                    />
                  }
                  content={
                    <Popup
                      flowing={true}
                      on="click"
                      inverted={true}
                      trigger={
                        <Button
                          basic={true}
                          color="red"
                          content="Confirm container removal"
                          onClick={this.handleContainerRm}
                        />
                      }
                      content={updateError.message}
                    />
                  }
                  on="click"
                  position="bottom left"
                  basic={true}
                />
              ) : (
                <>
                  <Button
                    basic={true}
                    color="blue"
                    labelPosition="left"
                    icon="double angle right"
                    content="Run"
                    loading={isFetchingState}
                    onClick={this.handleStatusButton.bind(this, "create")}
                  />
                  {admin && (
                    <Popup
                      trigger={
                        <Button
                          basic={true}
                          color="red"
                          icon="trash"
                          title="Delete permanently"
                          loading={isFetchingState}
                        />
                      }
                      content={
                        <Button
                          basic={true}
                          color="red"
                          icon="warning sign"
                          content="Remove permanently"
                          onClick={this.handleStatusButton.bind(
                            this,
                            "destroy"
                          )}
                        />
                      }
                      on="click"
                      position="bottom left"
                      basic={true}
                    />
                  )}
                </>
              )}
            </Button.Group>

            {containerState === "running" && container.Ports && daemon.host && (
              <Dropdown
                className="button basic icon"
                icon="external alternate"
                title="Links (Ports external:internal)"
              >
                <Dropdown.Menu>
                  {container.Ports.filter(
                    p => p.PublicPort && p.IP === "0.0.0.0"
                  ).map((p: IPort) => (
                    <Dropdown.Item
                      key={p.PublicPort}
                      as="a"
                      href={`http://${daemon.host}:${p.PublicPort}`}
                      target="_blank"
                    >
                      {`${p.PublicPort}:${p.PrivatePort}`}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}

            {container.Status && (
              <Modal
                trigger={
                  <Button basic={true} icon="align left" title="Show logs" />
                }
                size="fullscreen"
              >
                <Modal.Content style={{ background: "black", color: "white" }}>
                  <pre style={{ whiteSpace: "pre-line" }}>
                    <TextSocket
                      wsPath={`/api/daemons/${daemon._id}/docker/containers/${container.Id}/log`}
                    />
                  </pre>
                </Modal.Content>
              </Modal>
            )}

            {containerState === "running" && (
              <>
                <Modal
                  trigger={
                    <Button basic={true} icon="code" title="Run commands" />
                  }
                  size="tiny"
                >
                  <Modal.Header>
                    {containerName + " available commands :"}
                  </Modal.Header>
                  <Modal.Content>
                    <Commands
                      images={images}
                      daemon={daemon}
                      container={container}
                    />
                  </Modal.Content>
                </Modal>

                {this.allowShell && (
                  <Modal
                    trigger={
                      <Button
                        basic={true}
                        circular={true}
                        floated="right"
                        icon="terminal"
                        title="Exec shell"
                      />
                    }
                    size="fullscreen"
                  >
                    <Modal.Content style={{ background: "black" }}>
                      <ShellSocket
                        wsPath={`/api/daemons/${daemon._id}/docker/containers/${container.Id}/term`}
                      />
                    </Modal.Content>
                  </Modal>
                )}
              </>
            )}

            {(container.Status || admin) && (
              <Modal
                trigger={
                  <Button basic={true} icon="cog" title="Inspect container" />
                }
                size="fullscreen"
              >
                <Modal.Content style={{ background: "black", color: "white" }}>
                  <pre>{JSON.stringify(container, null, 2)}</pre>
                </Modal.Content>
              </Modal>
            )}

            <Dropdown className="button basic" text="Copy">
              <Dropdown.Menu>
                <Dropdown.Item onClick={copy.bind(this, containerName)}>
                  Container name
                </Dropdown.Item>
                <Dropdown.Item onClick={copy.bind(this, containerImage)}>
                  Container image
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={copy.bind(this, `docker pull ${containerImage}`)}
                >
                  Pull command
                </Dropdown.Item>
                <Dropdown.Item>Create command</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Segment>
        </Card.Content>
      </Card>
    );
  }

  private handleContainerRm = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    this.setState({ isFetchingState: true });
    saveContainers(this.props.groupId || "")
      .then(() => this.handleStatusButton("remove"))
      .catch(saveError => this.setState({ saveError, isFetchingState: false }));
  };

  private handleStatusButton = (state: string) => {
    const { container, daemon, refresh } = this.props;

    this.setState({ isFetchingState: true });

    if (daemon) {
      changeContainersStatus(daemon._id, state, [container.Id])
        .then(() => refresh())
        .catch(error => this.setState({ updateError: error, isFetchingState: false }));
    }
  };

  private getStatusColor = (state: string) => {
    let color: "green" | "orange" | "red" | "black" | "grey" | undefined =
      "grey";
    switch (state) {
      case "running":
        color = "green";
        break;
      case "exited":
        color = "orange";
        break;
      case "dead":
        color = "black";
        break;
      case "removed":
        color = "red";
        break;
      default:
        break;
    }
    return color;
  };

  private containerStatus = () => {
    const status = this.props.container.Status;
    const state = status ? this.props.container.State : "removed";

    return (
      <Label
        color={this.getStatusColor(state)}
        title={status || "Removed"}
        content={state.toUpperCase()}
      />
    );
  };

  private computeAllowShell = () => {
    const { admin, images } = this.props;

    if (admin) {
      return true;
    }

    for (const image of images) {
      if (image.is_allow_shell) {
        return true;
      }
    }

    return false;
  };
  private allowShell = this.computeAllowShell();
}
