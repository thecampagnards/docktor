
import * as React from 'react';
import {
     Dimmer, Loader, Message, List, Icon, ListItemProps, Modal, Button, Header
} from 'semantic-ui-react';

import { IContainer, IDaemon } from '../Daemon/types/daemon';
import { IGroup } from '../Group/types/group';
import { fetchImage } from '../Images/actions/image';
import { IImage } from '../Images/types/image';

interface IContainerCommandsProps {
  daemon?: IDaemon;
  group?: IGroup;
  container: IContainer;
}

interface IContainerCommandsStates {
  images: IImage[];
  error: Error;
  isFetching: boolean;
  modalView: boolean;
  log: string;
  variables: object;
}

export default class ContainerCommands extends React.Component<
  IContainerCommandsProps,
  IContainerCommandsStates
> {
  public state = {
    log: "",
    images: [] as IImage[],
    error: Error(),
    isFetching: true,
    modalView: false,
    variables: {}
  };

  public componentWillMount() {
    fetchImage(this.props.container.Image)
      .then(images => this.setState({ images }))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { error, images, isFetching, log } = this.state;

    if (isFetching) {
      return (
        <Dimmer active={true} inverted={true}>
          <Loader active={true} content={log} />
        </Dimmer>
      );
    }

    return (
      <>
        {error.message && (
          <Message negative={true}>
            <Message.Header>{error.message}</Message.Header>
          </Message>
        )}
        {log && (
          <Message info={true}>
            <Message.Header style={{ whiteSpace: "pre" }}>{log}</Message.Header>
          </Message>
        )}
        <List selection={true}>
          {images.map((image, imageKey) =>
            image.commands.map((c, commandkey) => (
                <List.Item key={commandkey} name={commandkey} onClick={this.showCommand} >
                  <Icon name="chevron right" /> {c.title}
                  <Modal
        open={this.state.modalView}
        onClose={this.hideCommand}
        size='small'
      >
        <Header icon='chevron right' content="uygc" />
        <Modal.Content>
          {c.command}
        </Modal.Content>
        <Modal.Actions>
          <Button color='green'>
            <Icon name='play' /> Run
          </Button>
        </Modal.Actions>
      </Modal>
                </List.Item>
                
            ))
          )}
        </List>

      </>
    );
  }

  private showCommand = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    { name }: ListItemProps
  ) => {
    this.setState({ modalView: true });
  }

  private hideCommand = () => {
    this.setState({ modalView: false });
  }
/*
  private Exec = (imageKey: number, commandkey: number) => {
    const { daemon, container } = this.props;
    const { images, variables } = this.state;

    const command = images[imageKey].commands[commandkey];
    const imageVariables = command.variables;

    if (imageVariables) {
      for (const v of imageVariables) {
        if (!variables[v]) {
          this.setState({ log: "", error: Error(`Please set a value for ${v}`) });
          return;
        }
      }
    }

    this.setState({ isFetching: true, log: `Running command ${command.title} ...` });

    execDockerCommand(
      daemon!._id,
      container.Names[0] || container.Name,
      images[imageKey]._id,
      command.title,
      variables
    )
      .then(log => this.setState({ log, error: Error() }))
      .catch(error => this.setState({ error, log: "" }))
      .finally(() => this.setState({ isFetching: false }));
  };

  private handleInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    { value, name }: InputOnChangeData
  ) => {
    this.setState(_.set(this.state, name, value));
  };*/
}
