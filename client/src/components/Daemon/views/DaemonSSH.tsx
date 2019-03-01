import * as React from "react";
import * as _ from 'lodash';

import { Button, Form, Message, Modal, Icon } from 'semantic-ui-react';

import CmdSocket from "../../layout/CmdSocket";

import { IDaemon } from "../types/daemon";
import { execCommand, saveDaemon } from '../actions/daemon';

interface IDaemonSSHProps {
  daemon: IDaemon;
}

interface IDaemonSSHStates {
  commands: ICommand[];
  error: Error | null;
  isSuccess: boolean;
  isFetching: boolean;
}

interface ICommand {
  command: string;
  data: string;
  error: Error | null;
  isOpen: boolean;
  isFetching: boolean;
}

class Daemon extends React.Component<
  IDaemonSSHProps, IDaemonSSHStates
  > {

  public state = {
    commands: [] as ICommand[],
    error: null,
    isSuccess: false,
    isFetching: false
  }

  public componentWillMount() {
    const commands = this.props.daemon.SSH.Commands.map(c => ({
      command: c,
      data: "",
      error: null,
      isOpen: false,
      isFetching: false
    }));

    this.setState({ commands });
  }

  public render() {
    const { daemon } = this.props;
    const { commands, error, isFetching, isSuccess } = this.state;
    return (
      <>
        <CmdSocket apiURL={`/api/daemons/${daemon._id}/ssh/term`} />
        <br />
        <Form success={isSuccess} error={error !== null}>
          <Button icon={true} onClick={this.handleAdd}>
            <Icon name='plus' />
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
                trigger={<Button loading={command.isFetching} disabled={!command.command.length} color={command.error ? "red" : "green"} icon="chevron right" onClick={this.handleOpen.bind(this, command, index)} />}
                open={command.isOpen}
                onClose={this.handleClose.bind(this, command, index)}
                basic={true}
                size='small'
              >
                <Modal.Content>
                  <span style={{ whiteSpace: "pre-line" }}>{command.error ? command.error.message : command.data}</span>
                </Modal.Content>
              </Modal>
            </Form.Group>
          ))}
          <Message error={true} header="Error" content={error && (error as Error).message} />
          <Button type="submit" loading={isFetching} onClick={this.submit}>Save</Button>
        </Form>
      </>
    );
  }

  private handleOpen = (command: ICommand, index: number) => {
    const { daemon } = this.props;
    const { commands } = this.state;

    command.isFetching = true
    commands[index] = command

    this.setState({ commands })

    execCommand(daemon, [command.command])
      .then((d: string[]) => {
        command.data = d[command.command]
        command.error = null
        command.isOpen = true
        command.isFetching = false

        commands[index] = command
        this.setState({ commands })
      }
      )
      .catch((error: Error) => {
        command.data = ""
        command.error = error
        command.isOpen = true
        command.isFetching = false

        commands[index] = command
        this.setState({ commands })
      });
  }

  private handleClose = (command: ICommand, index: number) => {
    const { commands } = this.state;
    command.isOpen = false
    command.isFetching = false
    commands[index] = command
    this.setState({ commands });
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value }: any
  ) => {
    this.setState({ commands: _.set(this.state.commands, name, value) });
  };

  private handleAdd = () => {
    const { commands } = this.state;
    commands.push({
      command: "",
      data: "",
      error: null,
      isOpen: false,
      isFetching: false
    })
    this.setState({ commands });
  }

  private submit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    this.setState({ isFetching: true });

    const commands = this.state.commands.filter(c => c.command)

    const d: any = {
      _id: this.props.daemon._id,
      SSH: {
        Commands: commands.map(c => c.command)
      }
    }

    saveDaemon(d)
      .then(() => this.setState({ isSuccess: true, isFetching: false, commands }))
      .catch((error: Error) => this.setState({ error, isFetching: false, commands }));
  };
}

export default Daemon;
