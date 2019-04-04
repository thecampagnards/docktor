import * as React from 'react';
import { Message } from 'semantic-ui-react';

import { IDaemon } from '../Daemon/types/daemon';
import { IGroup } from '../Group/types/group';
import { GetToken } from '../User/actions/user';

interface ISocketProps {
  daemon?: IDaemon;
  group?: IGroup;
  containerID: string;
}

interface ISocketStates {
  logs: string;
  error: Error;
  ws: WebSocket;
}

export default class ContainerLogSocket extends React.Component<
  ISocketProps,
  ISocketStates
> {
  public state = {
    logs: "",
    error: Error(),
    ws: {} as WebSocket
  };

  public componentWillMount() {
    const { group, daemon, containerID } = this.props;

    const loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
      uri = "wss:";
    }
    uri += `//${loc.hostname}:`;
    uri += process.env.NODE_ENV === "development" ? "8080" : loc.port;
    uri += "/api"
    uri += group ? `/groups/${group._id}` : `/daemons/${daemon!._id}`;

    const ws = new WebSocket(
      `${uri}/docker/containers/${containerID}/log?jwt_token=${GetToken()}`
    );

    ws.onmessage = e => {
      const logs = this.state.logs.concat(e.data);
      this.setState({ logs });
    };
    ws.onerror = e => this.setState({ error: new Error("WebSocket error") });
    ws.onclose = e =>
      !e.wasClean &&
      this.setState({
        error: new Error(`WebSocket error: ${e.code} ${e.reason}`)
      });

    this.setState({ ws });
  }

  public componentWillUnmount() {
    this.state.ws.close();
  }

  public render() {
    const { logs, error } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>Error with the websocket</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    return logs;
  }
}
