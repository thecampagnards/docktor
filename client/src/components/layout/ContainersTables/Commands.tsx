import * as _ from 'lodash';
import * as React from 'react';
import {
    Button, Dimmer, Form, Header, InputOnChangeData, List, Loader, Message
} from 'semantic-ui-react';

import { execDockerCommand } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import { IImage } from '../../Images/types/image';

interface ICommandsProps {
  daemon: IDaemon;
  images: IImage[];
  container: IContainer;
}

interface ICommandsStates {
  error: Error;
  isFetching: boolean;
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
    isFetching: true,
    variables: {}
  };

  public render() {
    const { images } = this.props;
    const { error, isFetching, log } = this.state;

    if (isFetching) {
      return (
        <Dimmer active={true} inverted={true}>
          <Loader active={true} />
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
        <List divided={true} verticalAlign="middle">
          {images.map((image, imageKey) =>
            image.commands.map((c, commandkey) => (
              <List.Item key={commandkey}>
                <List.Content floated="right">
                  <Button onClick={this.Exec.bind(this, imageKey, commandkey)}>
                    Exec
                  </Button>
                </List.Content>
                <List.Content>
                  <Header as="h3">
                    {c.title}
                    <Header.Subheader>{c.command}</Header.Subheader>
                  </Header>
                  {c.variables && (
                    <Form>
                      <Form.Group widths="equal">
                        {c.variables.map(v => (
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
                </List.Content>
              </List.Item>
            ))
          )}
        </List>
        <br />
      </>
    );
  }

  private Exec = (imageKey: number, commandkey: number) => {
    const { images, daemon, container } = this.props;
    const { variables } = this.state;

    const imageVariables = images[imageKey].commands[commandkey].variables;

    if (imageVariables) {
      for (const v of imageVariables) {
        if (!variables[v]) {
          this.setState({ log: "", error: Error(`Please set ${v}`) });
          return;
        }
      }
    }

    this.setState({ isFetching: true });

    execDockerCommand(
      daemon!._id,
      container.Names[0] || container.Name,
      images[imageKey]._id,
      images[imageKey].commands[commandkey].title,
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
