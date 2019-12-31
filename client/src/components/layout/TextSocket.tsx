import * as React from 'react';
import { Button, Message } from 'semantic-ui-react';
import { FitAddon } from 'xterm-addon-fit';

import { GetToken } from '../User/actions/user';

interface ITextSocketProps {
  wsPath: string;
}

interface ITextSocketStates {
  logs: string;
  error: Error;
  follow: boolean;
}

export default class TextSocket extends React.Component<
  ITextSocketProps,
  ITextSocketStates
> {
  public state = {
    logs: "",
    error: Error(),
    follow: true
  };

  private ws: WebSocket;
  private textLog: HTMLSpanElement | null;
  private fitAddon: FitAddon;

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

    this.ws.onopen = () => {
      this.fitAddon = new FitAddon();
    };

    this.ws.onmessage = e => {
      const logs = this.state.logs.concat(e.data);
      try {
        this.fitAddon.fit();
      } catch {
        console.warn(`Unable to fit the logs: ${e}`);
      }
      this.setState({ logs });
    };
    this.ws.onerror = _ => {
      this.setState({ error: new Error("WebTextSocket error") });
    };
    this.ws.onclose = e => {
      this.fitAddon && this.fitAddon.dispose();
      if (!e.wasClean && e.code !== 1000) {
        this.setState({
          error: new Error(`WebTextSocket error: ${e.code} ${e.reason}`)
        });
      }
    };
  }

  public componentDidUpdate() {
    if (this.state.follow && this.textLog) {
      this.textLog.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }

  public componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.fitAddon) {
      this.fitAddon.dispose();
    }
  }

  public render() {
    const { logs, follow, error } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>Error with the websocket</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    return (
      <>
        <span ref={textLog => (this.textLog = textLog)}>{logs}</span>
        <Button
          basic={true}
          onClick={this.handleToggle}
          active={follow}
          color="blue"
          style={{ position: "fixed", right: 0 }}
        >
          {follow ? "Unfollow" : "Follow"}
        </Button>
      </>
    );
  }

  private handleToggle = () => this.setState({ follow: !this.state.follow });
}
