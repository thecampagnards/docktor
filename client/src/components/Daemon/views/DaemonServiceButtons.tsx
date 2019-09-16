import * as React from 'react';
import { Button, Popup, SemanticCOLORS } from 'semantic-ui-react';

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

  private buttons = [
    {
      color: "green",
      icon: "play",
      action: "start"
    },
    {
      color: "orange",
      icon: "stop",
      action: "stop"
    },
    {
      color: "red",
      icon: "delete",
      action: "remove"
    }
  ];

  public render() {
    const { result, error, isFetching } = this.state;
    return (
      <Button.Group>
        {this.buttons.map((button, index) => (
          <Popup
            key={index}
            flowing={true}
            on="click"
            inverted={true}
            trigger={
              <Button
                compact={true}
                loading={isFetching}
                color={button.color as SemanticCOLORS}
                icon={button.icon}
                onClick={this.handleOnClick.bind(this, button.action)}
              />
            }
            content={error.message ? error.message : result}
          />
        ))}
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
