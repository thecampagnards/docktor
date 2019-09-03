import * as React from 'react';
import { Button, Card, Label, Grid, Segment, Popup, Dropdown, Modal } from 'semantic-ui-react';

import { IContainer, IPort, IDaemon } from '../../Daemon/types/daemon';
import { IImage } from '../../Images/types/image';
import TextSocket from '../TextSocket';
import { copy } from '../../../utils/clipboard';
import ShellSocket from '../ShellSocket';
import Commands from './Commands';
import { changeContainersStatus } from '../../Daemon/actions/daemon';

interface IContainerCardProps {
    daemon: IDaemon;
    container: IContainer;
    admin: boolean;
    refresh: () => void;
    images: IImage[];
}

interface IContainerCardState {
    containerState: string;
    isFetchingState: boolean;
    updateError: Error;
}

export default class ContainerCard extends React.Component<IContainerCardProps, IContainerCardState> {
    public state = {
        containerState: this.props.container.Status ? this.props.container.State : "removed",
        isFetchingState: false,
        updateError: Error(),
    }

    private containerName = this.props.container.Name || this.props.container.Names[0] || "Container";
    private containerImage = this.props.container.Config ? this.props.container.Config.Image : this.props.container.Image;

    public getDerivedStateFromProps() {
        const containerState = this.props.container.Status ? this.props.container.State : "removed";

        if (containerState === "removed") {
            this.containerName = this.props.container.Name;
            this.containerImage = this.props.container.Config.Image;
        }

        this.setState({ containerState })
    }

    public render() {
        const { container, daemon, images, admin } = this.props;
        const { containerState, isFetchingState, updateError } = this.state;

        return (
            <Card fluid={true} color={this.getStatusColor(containerState)}>
                <Card.Content>
                    <Grid>
                        <Grid.Column width={13}>
                            <Card.Header>{this.containerName.toUpperCase()}</Card.Header>
                            <Card.Meta>{this.containerImage}</Card.Meta>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            {this.containerStatus()}
                        </Grid.Column>
                    </Grid>
                </Card.Content>
                <Card.Content>
                    <Segment>
                        <Button.Group style={{ "marginRight": 10 }}>
                            {containerState === "running" && (
                                <>
                                    <Button basic={true} color="green" icon="redo" title="Restart"
                                        loading={isFetchingState} onClick={this.handleStatusButton.bind(this, "restart")}
                                    />
                                    <Button basic={true} color="orange" icon="stop" title="Stop"
                                        loading={isFetchingState} onClick={this.handleStatusButton.bind(this, "stop")}
                                    />
                                </>
                            )}
                            {containerState === "exited" &&
                                <Button basic={true} color="green" icon="play" title="Start"
                                    loading={isFetchingState} onClick={this.handleStatusButton.bind(this, "start")}
                                />
                            }
                            {container.Status ?
                                <Popup
                                    trigger={<Button basic={true} color="red" icon="delete" title="Delete" loading={isFetchingState} />}
                                    content={
                                        <Button basic={true} color="red"
                                            content="Confirm container removal" onClick={this.handleStatusButton.bind(this, "remove")}
                                        />}
                                    on="click"
                                    position="bottom left"
                                    basic={true}
                                />
                                :
                                <>
                                    <Button basic={true} color="blue" icon="sliders" content="Create"
                                        loading={isFetchingState} onClick={this.handleStatusButton.bind(this, "create")}
                                    />
                                    <Popup
                                        trigger={<Button basic={true} color="red" icon="trash" title="Delete permanently" loading={isFetchingState} />}
                                        content={
                                            <Button basic={true} color="red" icon="warning sign"
                                                content="Remove permanently" onClick={this.handleStatusButton.bind(this, "destroy")}
                                            />}
                                        on="click"
                                        position="bottom left"
                                        basic={true}
                                    />
                                </>
                            }
                        </Button.Group>

                        {containerState === "running" && container.Ports && daemon.host && (
                            <Dropdown className="button basic icon" icon="external alternate" title="Links (Ports external:internal)">
                                <Dropdown.Menu>
                                    {container.Ports
                                        .filter(p => p.PublicPort && p.IP === "0.0.0.0")
                                        .map((p: IPort) => (
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
                            <Modal trigger={<Button basic={true} icon="align left" title="Show logs" />} size="fullscreen">
                                <Modal.Content style={{ background: "black", color: "white" }}>
                                    <pre style={{ whiteSpace: "pre-line" }}>
                                    <TextSocket wsPath={`/api/daemons/${daemon._id}/docker/containers/${container.Id}/log`} />
                                    </pre>
                                </Modal.Content>
                            </Modal>
                        )}

                        {containerState === "running" && (
                            <>
                                <Modal trigger={<Button basic={true} icon="code" title="Run commands" />} size="tiny">
                                    <Modal.Header>
                                        {this.containerName + " available commands :"}
                                    </Modal.Header>
                                    <Modal.Content>
                                        <Commands images={images} daemon={daemon} container={container} />
                                    </Modal.Content>
                                </Modal>

                                {this.allowShell && (
                                    <Modal trigger={<Button basic={true} circular={true} floated="right" icon="terminal" title="Exec shell" />} size="fullscreen">
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
                            <Modal trigger={<Button basic={true} icon="cog" title="Inspect container" />} size="fullscreen">
                                <Modal.Content style={{ background: "black", color: "white" }}>
                                    <pre>{JSON.stringify(container, null, 2)}</pre>
                                </Modal.Content>
                            </Modal>
                        )}

                        <Dropdown className="button basic" text="Copy">
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={copy.bind(this, this.containerName)}>
                                    Container name
                                </Dropdown.Item>
                                <Dropdown.Item onClick={copy.bind(this, this.containerImage)}>
                                    Container image
                                </Dropdown.Item>
                                <Dropdown.Item>Pull command</Dropdown.Item>
                                <Dropdown.Item>Create command</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                    </Segment>
                </Card.Content>
            </Card>
        )
    }

    private handleStatusButton = (state: string) => {
        const { container, daemon, refresh } = this.props;
    
        this.setState({ isFetchingState: true });
    
        if (daemon) {
          changeContainersStatus(daemon._id, state, [container.Id])
            .then(() => refresh())
            .catch(error => this.setState({ updateError: error }))
            .finally(() => this.setState({ isFetchingState: false }));
        }
    };

    private getStatusColor = (state: string) => {
        let color: "green" | "orange" | "red" | "black" | "grey" | undefined = "grey";
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
    }

    private containerStatus = () => {
        const status = this.props.container.Status;
        const state = status ? this.props.container.State : "removed";
        
        return <Label color={this.getStatusColor(state)} title={status || "Removed"} content={state.toUpperCase()} />;
    }

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
 