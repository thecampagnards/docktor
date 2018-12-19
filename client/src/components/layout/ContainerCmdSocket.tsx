import * as React from "react";
import { IDaemon } from "../Daemon/types/daemon";
import { Terminal } from "xterm";
import "xterm/dist/xterm.css";

interface ISocketProps {
  daemon: IDaemon;
  containerID: string;
}

interface ISocketStates {
  ws: WebSocket;
  term: Terminal;
}

export default class ContainerCmdSocket extends React.Component<
  ISocketProps,
  ISocketStates
> {
  public state = {
    error: "",
    term: {} as Terminal,
    ws: {} as WebSocket
  };

  private container: HTMLElement;

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

    const ws = new WebSocket(uri + daemon._id + "/commands/" + containerID);

    ws.onopen = () => {
      const term = new Terminal({
        cursorBlink: true
      });

      term.open(this.container);

      term.setOption("screenKeys", true);

      term.on("data", data => {
        ws.send(data);
      });

      ws.onmessage = evt => {
        term.write(evt.data);
      };

      ws.onclose = e => {
        term.write("Session terminated");
        term.destroy();

        if (!e.wasClean) {
          term.write(
            `${shellRed}WebSocket error: ${e.code} ${e.reason}${shellNc}`
          );
        }
      };

      ws.onerror = () => {
        term.write(`${shellRed}WebSocket error${shellNc}`);
      };

      this.setState({ term });
    };

    this.setState({ ws });
  }

  public componentWillUnmount() {
    this.state.ws.close();
    this.state.term.destroy();
  }

  public render() {
    return React.createElement("div", {
      ref: ref => (this.container = ref as HTMLElement)
    });
  }
}
