import "./ContainerCard.css";

import * as React from "react";
import {
  Button,
  Card,
  Dropdown,
  Grid,
  Label,
  Modal,
  Popup,
  Segment,
} from "semantic-ui-react";

import { copy } from "../../../utils/clipboard";
import { changeContainersStatus } from "../../Daemon/actions/daemon";
import { IContainer, IDaemon, IPort } from "../../Daemon/types/daemon";
import { saveContainers } from "../../Group/actions/group";
import { IImage } from "../../Images/types/image";
import ShellSocket from "../ShellSocket";
import TextSocket from "../TextSocket";
import Commands from "./Commands";

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
  isFetchingState: string;
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

    return { containerState, containerName, containerImage };
  }

  public state = {
    containerName: "",
    containerImage: "",
    containerState: this.props.container.Status
      ? this.props.container.State
      : "removed",
    isFetchingState: "",
    updateError: Error(),
    saveError: Error(),
  };

  private service =
    this.props.container.Labels &&
    Object.keys(this.props.container.Labels).includes("SERVICE_NAME");
  private composeServiceName =
    this.service &&
    Object.keys(this.props.container.Labels).includes(
      "com.docker.compose.service"
    )
      ? this.props.container.Labels["com.docker.compose.service"]
      : "?";
  private containerService = this.service
    ? `Service : ${this.props.container.Labels["SERVICE_NAME"]} - ${this.composeServiceName}`
    : "No service associated";
  private publicPorts = this.props.container.Ports
    ? this.props.container.Ports.filter(
        (p) => p.PublicPort && p.IP === "0.0.0.0"
      )
    : [];

  public render() {
    const { container, daemon, images, admin } = this.props;
    const {
      containerName,
      containerImage,
      containerState,
      isFetchingState,
      updateError,
    } = this.state;

    return (
      <Card fluid={true} color={this.getStatusColor(containerState)}>
        <Card.Content>
          <Grid>
            <Grid.Column width={13}>
              <Card.Header>{containerName.toUpperCase()}</Card.Header>
              <Card.Meta>{containerImage}</Card.Meta>
              <Card.Description>{this.containerService}</Card.Description>
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
                    loading={isFetchingState === "restart"}
                    disabled={isFetchingState !== ""}
                    onClick={this.handleStatusButton.bind(this, "restart")}
                  />
                  <Button
                    basic={true}
                    color="orange"
                    icon="stop"
                    title="Stop"
                    loading={isFetchingState === "stop"}
                    disabled={isFetchingState !== ""}
                    onClick={this.handleStatusButton.bind(this, "stop")}
                  />
                </>
              )}
              {(containerState === "exited" ||
                containerState === "created") && (
                <Button
                  basic={true}
                  color="green"
                  icon="play"
                  title="Start"
                  loading={isFetchingState === "start"}
                  disabled={isFetchingState !== ""}
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
                      loading={isFetchingState === "delete"}
                      disabled={isFetchingState !== ""}
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
                          disabled={isFetchingState !== ""}
                        />
                      }
                      content={updateError.message || "..."}
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
                    loading={isFetchingState === "create"}
                    disabled={isFetchingState !== ""}
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
                          loading={isFetchingState === "destroy"}
                          disabled={isFetchingState !== ""}
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
                          disabled={isFetchingState !== ""}
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

            {containerState === "running" && daemon.host && (
              <Dropdown
                className="button basic icon"
                icon="external alternate"
                title="Links (Ports external:internal)"
                disabled={this.publicPorts.length === 0}
              >
                <Dropdown.Menu>
                  {this.publicPorts.map((p: IPort) => (
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
                closeIcon={true}
                className="modal-shell"
              >
                <Modal.Content style={{ background: "black", color: "white" }}>
                  <pre style={{ whiteSpace: "pre-line", height: "100%" }}>
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
                    closeOnEscape={false}
                    closeIcon={true}
                    className="modal-shell"
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
                {admin && (
                  <Dropdown.Item
                    onClick={copy.bind(this, this.computeCreateCommand())}
                  >
                    Create command
                  </Dropdown.Item>
                )}
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
    if (this.props.groupId) {
      this.setState({ isFetchingState: "remove" });
      saveContainers(this.props.groupId)
        .then(() => this.handleStatusButton("remove"))
        .catch((saveError) =>
          this.setState({ saveError, isFetchingState: "" })
        );
    }
  };

  private handleStatusButton = (state: string) => {
    const { container, daemon, refresh } = this.props;

    if (daemon) {
      this.setState({ isFetchingState: state });
      changeContainersStatus(daemon._id, state, [container.Id])
        .then(() => refresh())
        .catch((error) => this.setState({ updateError: error }))
        .finally(() => this.setState({ isFetchingState: "" }));
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

  private computeCreateCommand = () => {
    const { container } = this.props;

    const name = container.Names ? container.Names[0] : container.Name;
    const network = container.HostConfig.NetworkMode || "";
    const image = container.Image || container.Config.Image;
    const ports = container.Ports
      ? container.Ports.map(
          (p) => `-p ${p.IP}:${p.PublicPort}:${p.PrivatePort}`
        ).join(" ")
      : "";
    const volumes = container.Mounts
      ? container.Mounts.map(
          (v) => `-v ${v.Destination}:${v.Source}${v.RW ? "" : ":ro"}`
        ).join("")
      : "";
    const variables = ""; // not returned by API
    const labels = container.Labels
      ? Object.entries(container.Labels)
          .map((l) => `-l ${l[0]}="${l[1]}"`)
          .join(" ")
      : "";

    const command = `docker create --name ${name} --network ${network} ${ports} ${volumes} ${variables} ${labels} ${image}`;

    return command;
  };
}
