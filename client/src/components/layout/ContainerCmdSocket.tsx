import * as React from "react";
import { IDaemon } from "../Daemon/types/daemon";
import { Terminal } from "xterm";
import "xterm/dist/xterm.css";

interface ISocketProps {
  daemon: IDaemon;
  containerID: string;
}

export default class ContainerCmdSocket extends React.Component<
  ISocketProps
> {
  private container: HTMLElement;
  private term: Terminal;
  private ws: WebSocket;

  public componentWillMount() {
    const { daemon, containerID } = this.props;

    const shellRed = "\x1B[1;3;31m";
    const shellNc = "\x1B[0m";

    const loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
      uri = "wss:";
    }
    uri += "//localhost:8080/api/daemons/";

    this.ws = new WebSocket(uri + daemon._id + "/commands/" + containerID);

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
