import 'xterm/css/xterm.css';

import chalk from 'chalk';
import * as React from 'react';
import { Terminal } from 'xterm';

import { GetToken } from '../User/actions/user';

interface IShellSocketProps {
  wsPath: string;
}

export default class ShellSocket extends React.Component<IShellSocketProps> {
  private container: HTMLElement;
  private term: Terminal;
  private ws: WebSocket;

  public componentDidMount() {
    const { wsPath } = this.props;

    const loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
      uri = "wss:";
    }
    uri += `//docktor:`;
    uri += process.env.NODE_ENV === "development" ? "8080" : loc.port;

    this.ws = new WebSocket(`${uri}${wsPath}?jwt_token=${GetToken()}`);

    this.ws.onopen = () => {
      this.term = new Terminal({
        cursorBlink: true
      });

      this.term.open(this.container);
      this.term.focus();

      const forcedChalk = new chalk.constructor({ enabled: true, level: 2 });

      this.term.writeln(
        forcedChalk.blue("ctrl+ins to copy and shift+ins to paste.")
      );
      this.term.writeln(
        forcedChalk.red("You are fully responsible for your actions!")
      );

      this.term.setOption("screenKeys", true);

      this.term.onData(data => {
        this.ws.send(data);
      });

      this.ws.onmessage = e => {
        this.term.write(e.data);
      };

      this.ws.onclose = e => {
        this.term.write(forcedChalk.green("Session terminated"));
        this.term.dispose();

        if (!e.wasClean) {
          this.term.write(
            forcedChalk.red(`WebSocket error: ${e.code} ${e.reason}`)
          );
        }
      };

      this.ws.onerror = () => {
        this.term.write(forcedChalk.red("WebSocket error"));
      };
    };
  }

  public componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.term) {
      this.term.dispose();
    }
  }

  public render() {
    return React.createElement("div", {
      ref: ref => (this.container = ref as HTMLElement)
    });
  }
}
