import * as _ from 'lodash';
import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import {
    Button, Dimmer, Form, Header, Icon, InputOnChangeData, List, ListItemProps, Loader, Message,
    Modal
} from 'semantic-ui-react';

import { execDockerCommand } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import { ICommand, IImage } from '../../Images/types/image';

interface ICommandsProps {
  daemon: IDaemon;
  images: IImage[];
  container: IContainer;
}

interface ICommandsStates {
  error: Error;
  isFetching: boolean;
  modalView: boolean;
  command: ICommand;
  log: string;
  variables: object;
}

export default class Commands extends React.Component<
  ICommandsProps,
  ICommandsStates
> {
  public state = {
    error: Error(),
    log: "",
    isFetching: false,

    modalView: false,
    command: {} as ICommand,
    variables: {}
  };

  public render() {
    const { images } = this.props;
    const { error, isFetching, log, modalView, command } = this.state;

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
              <List.Item
                key={`${imageKey}:${commandKey}`}
                name={c}
                onClick={this.showCommand}
              >
                <Icon name="chevron right" /> {c.title}
              </List.Item>
            ))
          )}
        </List>
        <Modal open={modalView} onClose={this.hideCommand} size="small">
          <Header icon="chevron right" content={command.title} />
          <Modal.Content>
            {error.message && (
              <Message negative={true}>
                <Message.Header>{error.message}</Message.Header>
              </Message>
            )}
            {log && (
              <Message info={true}>
                <Message.Header style={{ whiteSpace: "pre" }}>
                  {log}
                </Message.Header>
              </Message>
            )}
          </Modal.Content>
          <Modal.Content>
            <CodeMirror
              options={{
                mode: "shell",
                lint: true,
                theme: "material",
                lineNumbers: true,
                readOnly: true,
                cursorBlinkRate: -1
              }}
              value={command.command}
            />
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
            <Button
              icon={true}
              labelPosition="left"
              floated="left"
              onClick={this.hideCommand}
            >
              <Icon name="chevron circle left" /> Back
            </Button>
            <Button
              icon={true}
              labelPosition="right"
              color="green"
              onClick={this.exec}
            >
              <Icon name="play" /> Run
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
  };

  private hideCommand = () => {
    this.setState({ modalView: false, command: {} as ICommand });
  };

  private exec = () => {
    const { daemon, container } = this.props;
    const { variables, command } = this.state;

    const commandArgs = command.variables;

    if (commandArgs) {
      for (const a of commandArgs) {
        if (!variables[a]) {
          this.setState({
            log: "",
            error: Error(`Please set a value for ${a}`)
          });
          return;
        }
      }
    }

    this.setState({
      isFetching: true,
      log: `Running command ${command.title} ...`
    });

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
