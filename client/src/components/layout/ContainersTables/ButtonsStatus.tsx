import * as React from 'react';
import { Button, Icon, Popup } from 'semantic-ui-react';

import { status } from '../../../constants/container';
import { changeContainersStatus } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';

interface IButtonsStatusProps {
  daemon: IDaemon;
  container: IContainer;
}

interface IButtonsStatusStates {
  isFetching: boolean;
  error: Error;
}

export default class ButtonsStatus extends React.Component<
  IButtonsStatusProps,
  IButtonsStatusStates
> {
  public state = {
    isFetching: false,
    error: Error()
  };

  public render() {
    const { container } = this.props;
    const { isFetching, error } = this.state;

    switch (true) {
      case status.Started.includes(container.State):
        return (
          <Popup
            content={error.message}
            disabled={!error.message}
            inverted={true}
            trigger={
              <Button.Group vertical={true} compact={true} fluid={true}>
                <Button
                  loading={isFetching}
                  icon={true}
                  labelPosition="left"
                  color="orange"
                  onClick={this.handleOnClick.bind(this, "stop")}
                >
                  <Icon name="stop" /> STOP
                </Button>
                <Button
                  loading={isFetching}
                  icon={true}
                  labelPosition="left"
                  color="red"
                  onClick={this.handleOnClick.bind(this, "remove")}
                >
                  <Icon name="delete" /> DELETE
                </Button>
              </Button.Group>
            }
          />
        );
      case status.Stopped.includes(container.State):
        return (
          <Popup
            content={error.message}
            disabled={!error.message}
            inverted={true}
            trigger={
              <Button.Group vertical={true} compact={true} fluid={true}>
                <Button
                  loading={isFetching}
                  icon={true}
                  labelPosition="left"
                  color="green"
                  onClick={this.handleOnClick.bind(this, "start")}
                >
                  <Icon name="play" /> START
                </Button>
                <Button
                  loading={isFetching}
                  icon={true}
                  labelPosition="left"
                  color="red"
                  onClick={this.handleOnClick.bind(this, "remove")}
                >
                  <Icon name="delete" /> DELETE
                </Button>
              </Button.Group>
            }
          />
        );
      case status.Removed.includes(container.State):
        return (
          <Popup
            content={error.message}
            disabled={!error.message}
            inverted={true}
            trigger={
              <Button
                fluid={true}
                loading={isFetching}
                icon={true}
                labelPosition="left"
                color="blue"
                onClick={this.handleOnClick.bind(this, "create")}
              >
                <Icon name="sliders" /> CREATE
              </Button>
            }
          />
        );
      default:
        return (
          <Popup
            content={error.message}
            disabled={!error.message}
            inverted={true}
            trigger={
              <Button
                fluid={true}
                loading={isFetching}
                icon={true}
                labelPosition="left"
                color="blue"
                onClick={this.handleOnClick.bind(this, "create")}
              >
                <Icon name="sliders" /> CREATE
              </Button>
            }
          />
        );
    }
  }

  private handleOnClick = (state: string) => {
    const { container, daemon } = this.props;

    this.setState({ isFetching: true });

    if (daemon) {
      changeContainersStatus(daemon._id, state, [container.Id])
        .catch(error => this.setState({ error }))
        .finally(() => this.setState({ isFetching: false }));
    }
  };
}
