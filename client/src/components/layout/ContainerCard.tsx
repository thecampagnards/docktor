import * as React from 'react';
import { Button, Card, Icon, Label, Grid } from 'semantic-ui-react';

import { IContainer } from '../Daemon/types/daemon';
import { IImage } from '../Images/types/image';

interface IContainerCardProps {
    container: IContainer,
    admin: boolean,
    images: IImage[],
}

export default class ContainerCard extends React.Component<IContainerCardProps> {
    public render() {
        const { container, admin } = this.props
        const containerName = container.Name || container.Names[0] || "Container";

        return (
            <Card fluid={true}>
                <Card.Content>
                    <Grid>
                        <Grid.Column width={13}>
                            <Card.Header>{containerName.toUpperCase()}</Card.Header>
                            <Card.Meta>{container.Image}</Card.Meta>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            {this.containerStatus}
                        </Grid.Column>
                    </Grid>
                </Card.Content>
                <Card.Content>
                    <Button.Group>
                        {container.Status && container.Status.startsWith("Up") && (
                            <>
                                <Button color="green" icon="redo" title="Restart" />
                                <Button color="orange" icon="stop" title="Stop" />
                            </>
                        )}
                        {container.Status && container.Status.startsWith("Exited") &&
                            <Button color="green" icon="play" title="Start" />
                        }
                        {container.Status ?
                            <Button color="red" icon="delete" title="Delete" />
                            :
                            <Button color="blue" icon="sliders" title="Create" />
                        }
                    </Button.Group>
                    
                </Card.Content>
            </Card>
        )
    }

    private containerStatus = () => {
        const status = this.props.container.Status || "Removed";
        switch (true) {
            case status.startsWith("Up"):
                return <Label color="green" title={status} content="RUNNING" />;
            case status.startsWith("Exited"):
                return <Label color="orange" title={status} content="EXITED" />;
            case status.startsWith("Dead"):
                return <Label color="black" title={status} content="DEAD" />;
            case status.startsWith("Removed"):
                return <Label color="red" title={status} content="REMOVED" />;
            default:
                return <Label color="grey" title={status} content="?" />;
        }
    }
}
