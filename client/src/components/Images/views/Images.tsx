import * as _ from 'lodash';
import * as React from 'react';
import { IInstance, UnControlled as CodeMirror } from 'react-codemirror2';
import {
    Button, Form, Grid, Icon, InputOnChangeData, List, Loader, Message, TextAreaProps
} from 'semantic-ui-react';

import { fetchCommands, saveCommands } from '../actions/images';
import { ICommand } from '../types/images';

interface IImagesStates {
  commands: ICommand[];
  isFetching: boolean;
  isSuccess: boolean;
  error: Error;

  commandKey: number;
}

class Images extends React.Component<{}, IImagesStates> {
  public state = {
    commands: [] as ICommand[],
    isFetching: false,
    isSuccess: false,
    error: Error(),

    commandKey: 0
  };

  public componentWillMount() {
    this.setState({ isFetching: true });
    fetchCommands()
      .then(commands => this.setState({ commands }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { error, isSuccess, isFetching, commands, commandKey } = this.state;

    if (isFetching) {
      return (
        <>
          <h2>Commands</h2>
          <Loader active={true} />
        </>
      );
    }

    return (
      <>
        <h1>Commands</h1>
        <Form
          success={isSuccess}
          error={!!error.message}
          onSubmit={this.submit}
        >
          <Grid columns={2} divided={true}>
            <Grid.Row>
              <Grid.Column width={4}>
                <Button
                  type=""
                  icon={true}
                  onClick={this.addCommand}
                  color="green"
                >
                  <Icon name="plus" />
                  Add command
                </Button>
                <Button
                  type=""
                  icon={true}
                  onClick={this.removeCommand}
                  color="red"
                >
                  <Icon name="minus" />
                  Remove selected
                </Button>
                <List>
                  {commands.map((c, key) => (
                    <List.Item
                      key={key}
                      as={Button}
                      onClick={this.changeCommand(key)}
                      active={key === commandKey}
                      basic={true}
                      style={{ padding: 5, width: "100%" }}
                    >
                      <List.Icon name="terminal" />
                      <List.Content>
                        <List.Header>
                          <Form.Input
                            fluid={true}
                            value={c.image}
                            onChange={this.handleInput}
                            name={`commands.${key}.image`}
                          />
                        </List.Header>
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </Grid.Column>
              <Grid.Column width={12}>
                <Button
                  type=""
                  icon={true}
                  onClick={this.addSubCommand}
                  color="green"
                >
                  <Icon name="plus" />
                  Add command for {commands[commandKey].image}
                </Button>
                {commands[commandKey].commands.map((command, key) => (
                  <CodeMirror
                    key={key}
                    value={command}
                    options={{
                      mode: "shell",
                      theme: "material",
                      lineNumbers: true,
                      gutters: [`commands.${commandKey}.command.${key}`]
                    }}
                    autoCursor={false}
                    onChange={this.handleChangeCodeEditor}
                  />
                ))}
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br />
          <Message error={true} header="Error" content={error.message} />
          <Button type="submit" loading={isFetching}>
            Save
          </Button>
        </Form>
      </>
    );
  }

  private handleInput = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.FormEvent<HTMLTextAreaElement>,
    { value, name }: TextAreaProps | InputOnChangeData
  ) => {
    event.preventDefault();
    this.setState(_.set(this.state, name, value));
  };

  private handleChangeCodeEditor = (
    editor: IInstance,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState(_.set(this.state, editor.options.gutters![0], value));
  };

  private addCommand = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    let commands = this.state.commands;
    const command = {
      image: "",
      commands: [""]
    } as ICommand;
    commands ? commands.unshift(command) : (commands = [command]);
    this.setState({ commands });
  };

  private removeCommand = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    const { commands, commandKey } = this.state;
    this.setState({ commands: commands.splice(commandKey, commandKey) });
  };

  private addSubCommand = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    const { commands, commandKey } = this.state;
    commands[commandKey].commands.push("");
    this.setState({ commands });
  };

  private changeCommand = (commandKey: number) => (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    this.setState({ commandKey });
  };

  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { commands } = this.state;

    console.log(commands);

    this.setState({ isFetching: true });
    saveCommands(commands)
      .then(() => this.setState({ isSuccess: true, error: Error() }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };
}

export default Images;
