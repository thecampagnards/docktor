import * as React from "react";
import { IDaemon } from "../Daemon/types/daemon";
import { Input, Button, Message } from "semantic-ui-react";

interface ISocketProps {
  daemon: IDaemon;
  containerID: string;
}

interface ISocketStates {
  logs: string;
  error: string;
  command: string;
  ws: WebSocket;
}

export default class ContainerCmdSocket extends React.Component<
  ISocketProps,
  ISocketStates
> {
  public state = {
    logs: "",
    error: "",
    command: "echo 'toto' > /tmp/toto",
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

    const ws = new WebSocket(uri + daemon._id + "/commands/" + containerID);

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
    const { command, logs, error } = this.state;
    return (
      <>
        {error && (
          <Message negative={true}>
            <Message.Header>Error with the websocket</Message.Header>
            <p>{error}</p>
          </Message>
        )}
        <p>{logs}</p>
        <div>
          <Input placeholder="Command..." onChange={this.onChange} width={8} value={command}/>
          <Button content="Run" onClick={this.onClick} width={4} />
        </div>
      </>
    );
  }

  private onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    { value }: any
  ) => {
    this.setState({ command: value });
  };

  private onClick = () => {
    const { ws, command } = this.state;
    console.log(command)
    ws.send(command);
    this.setState({ command: "" });
  };
}
