import * as React from "react";
import { Terminal } from "xterm";
import "xterm/dist/xterm.css";

interface ISocketProps {
  apiURL: string;
}

export default class CmdSocket extends React.Component<
  ISocketProps
> {
  private container: HTMLElement;
  private term: Terminal;
  private ws: WebSocket;

  public componentWillMount() {
    const { apiURL } = this.props;

    const shellRed = "\x1B[1;3;31m";
    const shellNc = "\x1B[0m";

    const loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
      uri = "wss:";
    }
    uri += `//${loc.hostname}:`
    uri += process.env.NODE_ENV === "development" ? "8080" : loc.port

    this.ws = new WebSocket(uri + apiURL);

    this.ws.onopen = () => {
      this.term = new Terminal({
        cursorBlink: true
      });

      this.term.open(this.container);

      this.term.setOption("screenKeys", true);

      this.term.on("data", data => {
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
    this.ws.close();
    this.term.destroy();
  }

  public render() {
    return React.createElement("div", {
      ref: ref => (this.container = ref as HTMLElement)
    });
  }
}
