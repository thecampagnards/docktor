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

    if (container.Status) {
      return (
        <Popup
          content={error.message}
          disabled={!error.message}
          inverted={true}
          trigger={
            <Button.Group fluid={true}>
              <Button
                loading={isFetching}
                icon={true}
                color="green"
                disabled={status.Started.indexOf(container.State) > -1}
                onClick={this.handleOnClick.bind(this, "start")}
              >
                <Icon name="play" /> START
              </Button>
              <Button
                loading={isFetching}
                icon={true}
                color="orange"
                disabled={status.Stopped.indexOf(container.State) > -1}
                onClick={this.handleOnClick.bind(this, "stop")}
              >
                <Icon name="stop" /> STOP
              </Button>
              <Button
                loading={isFetching}
                icon={true}
                color="red"
                disabled={status.Removed.indexOf(container.State) > -1}
                onClick={this.handleOnClick.bind(this, "remove")}
              >
                <Icon name="delete" /> DELETE
              </Button>
            </Button.Group>
          }
        />
      );
    }

    return (
      <Popup
        content={error.message}
        disabled={!error.message}
        inverted={true}
        trigger={
          <Button
            loading={isFetching}
            icon={true}
            color="blue"
            disabled={status.Started.indexOf(container.State) > -1}
            onClick={this.handleOnClick.bind(this, "create")}
          >
            <Icon name="cog" /> CREATE
          </Button>
        }
      />
    );
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
