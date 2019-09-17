import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import {
    Button, Dimmer, Form, Header, Icon, InputOnChangeData, List, ListItemProps, Loader, Message,
    Modal
} from 'semantic-ui-react';

import { execDockerCommand } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import { ICommand, IImage, ICommandVariable } from '../../Images/types/image';

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
          {images.map(image =>
            image.commands.map(c => (
              <List.Item key={c._id} name={c} onClick={this.showCommand}>
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
              <Form id="cmd-form" onSubmit={this.exec}>
                <Form.Group widths="equal">
                  {command.variables.map((v, key) => (
                    <Form.Input
                      key={key}
                      inline={true}
                      label={v.name}
                      required={!v.optional}
                      onChange={this.handleInput}
                      name={v.name}
                      defaultValue={v.value}
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
              type="submit"
              form="cmf-form"
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
    this.setState({ modalView: false, command: {} as ICommand, log: "" });
  };

  private exec = () => {
    const { daemon, container } = this.props;
    const { command } = this.state;

    this.setState({
      isFetching: true,
      log: `Running command ${command.title} ...`
    });

    execDockerCommand(
      daemon._id,
      container.Names[0] || container.Name,
      command._id,
      command.variables || [] as ICommandVariable[]
    )
      .then(log => this.setState({ log, error: Error() }))
      .catch(error => this.setState({ error, log: "" }))
      .finally(() => this.setState({ isFetching: false }));
  };

  private handleInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    { value, name }: InputOnChangeData
  ) => {
    const command = this.state.command;
    const variables = command.variables || [];
    for (const variable of variables) {
      if (variable.name === name) {
        variable.value = value;
      }
    }
    command.variables = variables;
    this.setState({ command });
  };
}
