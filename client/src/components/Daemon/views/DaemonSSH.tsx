import * as _ from 'lodash';
import * as React from 'react';
import { Button, Form, Icon, Message, Modal } from 'semantic-ui-react';

import ShellSocket from '../../layout/ShellSocket';
import { execCommand, saveDaemon } from '../actions/daemon';
import { IDaemon } from '../types/daemon';

interface IDaemonSSHProps {
  daemon: IDaemon;
}

interface IDaemonSSHStates {
  commands: ICommand[];
  error: Error;
  isSuccess: boolean;
  isFetching: boolean;
}

interface ICommand {
  command: string;
  data: string;
  error: Error;
  isOpen: boolean;
  isFetching: boolean;
}

class Daemon extends React.Component<IDaemonSSHProps, IDaemonSSHStates> {
  public state = {
    commands: this.props.daemon.ssh.commands
      ? this.props.daemon.ssh.commands.map(c => ({
          command: c,
          data: "",
          error: Error(),
          isOpen: false,
          isFetching: false
        }))
      : ([] as ICommand[]),
    error: Error(),
    isSuccess: false,
    isFetching: false
  };

  public render() {
    const { daemon } = this.props;
    const { commands, error, isFetching, isSuccess } = this.state;
    return (
      <>
        <ShellSocket wsPath={`/api/daemons/${daemon._id}/ssh/term`} />
        <br />
        <Form success={isSuccess} error={!!error.message}>
          <Button icon={true} onClick={this.handleAdd}>
            <Icon name="plus" />
          </Button>
          <br />
          <br />
          {commands.map((command: ICommand, index) => (
            <Form.Group inline={true} key={index}>
              <Form.Input
                name={`${index}.command`}
                type="text"
                value={command.command}
                width={8}
                onChange={this.handleChange}
              />
              <Modal
                trigger={
                  <Button
                    loading={command.isFetching}
                    disabled={!command.command.length}
                    color={command.error.message ? "red" : "green"}
                    icon="chevron right"
                    onClick={this.handleOpen.bind(this, command, index)}
                  />
                }
                open={command.isOpen}
                onClose={this.handleClose.bind(this, command, index)}
                basic={true}
                size="small"
              >
                <Modal.Content>
                  <span style={{ whiteSpace: "pre-line" }}>
                    {command.error.message || command.data}
                  </span>
                </Modal.Content>
              </Modal>
            </Form.Group>
          ))}
          <Message error={true} header="Error" content={error.message} />
          <Button type="submit" loading={isFetching} onClick={this.submit}>
            Save
          </Button>
        </Form>
      </>
    );
  }

  private handleOpen = (command: ICommand, index: number) => {
    const { daemon } = this.props;
    const { commands } = this.state;

    command.isFetching = true;
    commands[index] = command;

    this.setState({ commands });

    command.isOpen = true;
    command.isFetching = false;

    execCommand(daemon, [command.command])
      .then((d: Map<string, string>) => {
        command.data = d.has(command.command)
          ? (d.get(command.command) as string)
          : "";
        command.error = Error();

        commands[index] = command;
        this.setState({ commands });
      })
      .catch((error: Error) => {
        command.data = "";
        command.error = error;

        commands[index] = command;
        this.setState({ commands });
      });
  };

  private handleClose = (command: ICommand, index: number) => {
    const { commands } = this.state;
    command.isOpen = false;
    command.isFetching = false;
    commands[index] = command;
    this.setState({ commands });
  };

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    { name, value }: any
  ) => {
    this.setState({ commands: _.set(this.state.commands, name, value) });
  };

  private handleAdd = () => {
    const { commands } = this.state;
    commands.push({
      command: "",
      data: "",
      error: Error(),
      isOpen: false,
      isFetching: false
    });
    this.setState({ commands });
  };

  private submit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    this.setState({ isFetching: true });

    const commands = this.state.commands.filter(c => c.command);

    const d: any = {
      _id: this.props.daemon._id,
      SSH: {
        Commands: commands.map(c => c.command)
      }
    };

    saveDaemon(d)
      .then(() =>
        this.setState({
          isSuccess: true,
          isFetching: false,
          commands,
          error: Error()
        })
      )
      .catch((error: Error) =>
        this.setState({ error, isFetching: false, commands })
      );
  };
}

export default Daemon;
