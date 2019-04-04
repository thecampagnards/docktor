import * as React from 'react';
import { Button, Popup } from 'semantic-ui-react';

import { changeComposeStatus } from '../actions/daemon';
import { IDaemon } from '../types/daemon';

interface IDaemonServiceButtons {
  daemon: IDaemon
  services: string[]
}

interface IDaemonsStates {
  error: Error
  isFetching: boolean
  result: string
}

export default class DaemonServiceButtons extends React.Component<IDaemonServiceButtons, IDaemonsStates> {

  public state = {
    error: Error(),
    isFetching: false,
    result: ""
  }

  public render() {
    const { services } = this.props
    const { result, error, isFetching } = this.state
    return <h4>
      {services.join(", ") + " : "}
      <Button.Group>
        <Popup flowing={true} on="click" inverted={true} trigger={<Button loading={isFetching} color="orange" onClick={this.handleOnClick.bind(this, "stop")}>
          Stop
      </Button>} content={error.message ? error.message : result} />
        <Button.Or />
        <Popup flowing={true} on="click" inverted={true} trigger={<Button loading={isFetching} color="red" onClick={this.handleOnClick.bind(this, "remove")}>
          Remove
      </Button>} content={error.message ? error.message : result} />
        <Button.Or />
        <Popup flowing={true} on="click" inverted={true} trigger={<Button loading={isFetching} color="green" onClick={this.handleOnClick.bind(this, "start")}>
          Start
      </Button>} content={error.message ? error.message : result} />
      </Button.Group>
    </h4>
  }

  private handleOnClick = (status: string) => {
    const { daemon, services } = this.props
    this.setState({ isFetching: true })
    changeComposeStatus(daemon._id, status, services).then(result => this.setState({ result, error: Error() }))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }))
  }
}