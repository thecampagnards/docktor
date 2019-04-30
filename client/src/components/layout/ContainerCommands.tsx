import * as _ from 'lodash';
import * as React from 'react';
import { Button, Form, Header, InputOnChangeData, List, Loader, Message } from 'semantic-ui-react';

import { execDockerCommand } from '../Daemon/actions/daemon';
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
  log: string;
}

export default class ContainerCommands extends React.Component<
  IContainerCommandsProps,
  IContainerCommandsStates
> {
  public state = {
    log: "",
    images: [] as IImage[],
    error: Error(),
    isFetching: true
  };

  public componentWillMount() {
    fetchImage(this.props.container.Image)
      .then(images => this.setState({ images }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { error, images, isFetching, log } = this.state;

    if (isFetching) {
      return <Loader active={true} />;
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
            <Message.Header>{log}</Message.Header>
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
                            name={`images.${imageKey}.commands.${commandkey}.variables.${v}`}
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
    const { daemon, container } = this.props;
    const { images } = this.state;

    const variables = images[imageKey].commands[commandkey].variables;

    if (variables) {
      for (const variable of variables) {
        if (!variables[variable]) {
          this.setState({ log: "", error: Error(`Please set ${variable}`) });
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
      images[imageKey].commands[commandkey].variables
    )
      .then(log => this.setState({ log }))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };

  private handleInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    { value, name }: InputOnChangeData
  ) => {
    this.setState(_.set(this.state, name, value));
  };
}
