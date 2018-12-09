import * as React from "react";
import { IDaemon } from "../Daemon/types/daemon";

interface ISocketProps {
  daemon: IDaemon;
  containerID: string;
}

interface ISocketStates {
  logs: string;
  error: string;
  ws: WebSocket;
}

export default class Socket extends React.Component<
  ISocketProps,
  ISocketStates
> {
  public state = {
    logs: "",
    error: "",
    ws: {} as WebSocket
  };

  public componentWillMount() {

    const { daemon, containerID } = this.props;

    const loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
      uri = "wss:";
    }
    uri += "//localhost:8080/api/daemons/";

    const ws = new WebSocket(uri + daemon._id + "/log/" + containerID);

    ws.onmessage = e => {
      const logs = this.state.logs.concat(e.data);
      this.setState({ logs });
    };
    ws.onerror = e => this.setState({ error: "WebSocket error" });
    ws.onclose = e =>
      !e.wasClean &&
      this.setState({ error: `WebSocket error: ${e.code} ${e.reason}` });

    this.setState({ ws });
  }

  public componentWillUnmount() {
    this.state.ws.close();
  }

  public render() {
    const { logs, error } = this.state;
    return (
      <>
        <p>{error}</p>
        <p>{logs}</p>
      </>
    );
  }
}
