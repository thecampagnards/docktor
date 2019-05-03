import * as _ from "lodash";
import * as React from 'react';
import {
     Dimmer, Loader, Message, List, Icon, ListItemProps, Modal, Button, Header, InputOnChangeData, Form
} from 'semantic-ui-react';

import { IContainer, IDaemon } from '../Daemon/types/daemon';
import { IGroup } from '../Group/types/group';
import { fetchImage } from '../Images/actions/image';
import { IImage, ICommand } from '../Images/types/image';
import { execDockerCommand } from '../Daemon/actions/daemon';

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
  command: ICommand;
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
    command: {} as ICommand,
    variables: {}
  };

  public componentWillMount() {
    fetchImage(this.props.container.Image)
      .then(images => this.setState({ images }))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { error, images, isFetching, log, modalView, command } = this.state;

    if (isFetching) {
      return (
        <Dimmer active={true} inverted={true}>
          <Loader active={true} content={log} />
        </Dimmer>
      );
    }

    return (
      <>
        <List selection={true}>
          {images.map((image, imageKey) =>
            image.commands.map((c, commandKey) => (
                <List.Item key={`${imageKey}:${commandKey}`} name={c} onClick={this.showCommand} >
                  <Icon name="chevron right" /> {c.title}
                </List.Item>
            ))
          )}
        </List>
        <Modal open={modalView} onClose={this.hideCommand} size='small'>
          <Header icon='chevron right' content={command.title} />
          <Modal.Content>
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
          </Modal.Content>
          <Modal.Content style={{ whiteSpace: "pre" }}>
            {command.command}
          </Modal.Content>
          <Modal.Content>
          {command.variables && (
            <Form>
              <Form.Group widths="equal">
                {command.variables.map(v => (
                  <Form.Input
                    key={v}
                    fluid={true}
                    label={v}
                    required={true}
                    onChange={this.handleInput}
                    name={`variables.${v}`}
                  />
                ))}
              </Form.Group>
            </Form>
          )}
          </Modal.Content>
          <Modal.Actions>
            <Button icon={true} labelPosition="left" floated="left" onClick={this.hideCommand}>
              <Icon name='chevron circle left' /> Back
            </Button>
            <Button icon={true} labelPosition="right" color='green' onClick={this.exec}>
              <Icon name='play' /> Run
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }

  private showCommand = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    { name }: ListItemProps
  ) => {
    const command = name as ICommand;
    this.setState({ modalView: true, command });
  }

  private hideCommand = () => {
    this.setState({ modalView: false, command: {} as ICommand });
  }

  private exec = () => {
    const { daemon, container } = this.props;
    const { variables, command } = this.state;

    const commandArgs = command.variables;

    if (commandArgs) {
      for (const a of commandArgs) {
        if (!variables[a]) {
          this.setState({ log: "", error: Error(`Please set a value for ${a}`) });
          return;
        }
      }
    }

    this.setState({ isFetching: true, log: `Running command ${command.title} ...` });

    execDockerCommand(
      daemon!._id,
      container.Names[0] || container.Name,
      command._id,
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
  };
}
