import "xterm/css/xterm.css";

import chalk from "chalk";
import * as React from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

import { GetToken } from "../User/actions/user";

interface IShellSocketProps {
  wsPath: string;
}

export default class ShellSocket extends React.Component<IShellSocketProps> {
  private container: HTMLElement;
  private term: Terminal;
  private ws: WebSocket;
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
      this.term = new Terminal({
        cursorBlink: true,
      });

      this.fitAddon = new FitAddon();
      this.term.loadAddon(this.fitAddon);

      this.term.open(this.container);
      this.term.focus();

      const forcedChalk = new chalk.Instance({ level: 2 });

      this.term.writeln(
        forcedChalk.blue("ctrl+ins to copy and shift+ins to paste.")
      );
      this.term.writeln(
        forcedChalk.red("You are fully responsible for your actions!")
      );

      this.term.onData((data) => {
        this.ws.send(data);
      });

      this.ws.onmessage = (e) => {
        this.term.write(e.data);
        try {
          this.fitAddon.fit();
        } catch {
          console.warn(`Unable to fit the term: ${e}`);
        }
      };

      this.ws.onclose = (e) => {
        this.term.write(forcedChalk.green("Session terminated"));
        this.term.dispose();
        this.fitAddon.dispose();

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
    if (this.fitAddon) {
      this.fitAddon.dispose();
    }
  }

  public render() {
    return React.createElement("div", {
      ref: (ref) => (this.container = ref as HTMLElement),
      style: { height: "100%", width: "100%" },
    });
  }
}
