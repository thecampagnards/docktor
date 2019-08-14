import * as React from 'react';
import { Message } from 'semantic-ui-react';

import { GetToken } from '../User/actions/user';

interface ITextSocketProps {
  wsPath: string;
}

interface ITextSocketStates {
  logs: string;
  error: Error;
}

export default class TextSocket extends React.Component<
  ITextSocketProps,
  ITextSocketStates
> {
  public state = {
    logs: "",
    error: Error()
  };

  private ws: WebSocket;

  public componentDidMount() {
    const { wsPath } = this.props;

    const loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
      uri = "wss:";
    }
    uri += `//${loc.hostname}:`;
    uri += process.env.NODE_ENV === "development" ? "8080" : loc.port;

    this.ws = new WebSocket(`${uri}${wsPath}?jwt_token=${GetToken()}`);

    this.ws.onmessage = e => {
      const logs = this.state.logs.concat(e.data);
      this.setState({ logs });
    };
    this.ws.onerror = _ => {
      this.setState({ error: new Error("WebTextSocket error") });
    };
    this.ws.onclose = e => {
      if (!e.wasClean && e.code !== 1000) {
        this.setState({
          error: new Error(`WebTextSocket error: ${e.code} ${e.reason}`)
        });
      }
    };
  }

  public componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
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
