import 'xterm/dist/xterm.css';

import * as React from 'react';
import { Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';

import { GetToken } from '../User/actions/user';

interface IShellSocketProps {
  wsPath: string;
}

export default class ShellSocket extends React.Component<IShellSocketProps> {
  private container: HTMLElement;
  private term: Terminal;
  private ws: WebSocket;

  public componentWillMount() {
    const { wsPath } = this.props;

    const shellRed = "\x1B[1331m";
    const shellNc = "\x1B[0m";

    const loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
      uri = "wss:";
    }
    uri += `//${loc.hostname}:`;
    uri += process.env.NODE_ENV === "development" ? "8080" : loc.port;

    this.ws = new WebSocket(`${uri}${wsPath}?jwt_token=${GetToken()}`);

    this.ws.onopen = () => {
      this.term = new Terminal({
        cursorBlink: true
      });

      this.term.open(this.container);
      fit(this.term);

      this.term.setOption("screenKeys", true);

      this.term.on("data", (data: string) => {
        this.ws.send(data);
      });

      this.ws.onmessage = e => {
        this.term.write(e.data);
      };

      this.ws.onclose = e => {
        this.term.write("Session terminated");
        this.term.destroy();

        if (!e.wasClean) {
          this.term.write(
            `${shellRed}WebSocket error: ${e.code} ${e.reason}${shellNc}`
          );
        }
      };

      this.ws.onerror = () => {
        this.term.write(`${shellRed}WebSocket error${shellNc}`);
      };
    };
  }

  public componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.term) {
      this.term.destroy();
    }
  }

  public render() {
    return React.createElement("div", {
      ref: ref => (this.container = ref as HTMLElement)
    });
  }
}