import * as React from 'react';
import { Button, Popup } from 'semantic-ui-react';

import { changeComposeStatus } from '../actions/daemon';
import { IDaemon } from '../types/daemon';

interface IDaemonServiceButtons {
  daemon: IDaemon;
  services: string[];
}

interface IDaemonsStates {
  error: Error;
  isFetching: boolean;
  result: string;
}

export default class DaemonServiceButtons extends React.Component<
  IDaemonServiceButtons,
  IDaemonsStates
> {
  public state = {
    error: Error(),
    isFetching: false,
    result: ""
  };

  public render() {
    const { result, error, isFetching } = this.state;
    return (
      <Button.Group>
        <Popup
          flowing={true}
          on="click"
          inverted={true}
          trigger={
            <Button
              compact={true}
              loading={isFetching}
              color="green"
              icon="play"
              onClick={this.handleOnClick.bind(this, "start")}
            />
          }
          content={error.message ? error.message : result}
        />
        <Popup
          flowing={true}
          on="click"
          inverted={true}
          trigger={
            <Button
              compact={true}
              loading={isFetching}
              color="orange"
              icon="stop"
              onClick={this.handleOnClick.bind(this, "stop")}
            />
          }
          content={error.message ? error.message : result}
        />
        <Popup
          flowing={true}
          on="click"
          inverted={true}
          trigger={
            <Button
              compact={true}
              loading={isFetching}
              color="red"
              icon="delete"
              onClick={this.handleOnClick.bind(this, "remove")}
            />
          }
          content={error.message ? error.message : result}
        />
      </Button.Group>
    );
  }

  private handleOnClick = (status: string) => {
    const { daemon, services } = this.props;
    this.setState({ isFetching: true });
    changeComposeStatus(daemon._id, status, services)
      .then(result => this.setState({ result, error: Error() }))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };
}
