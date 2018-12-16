import * as React from "react";
import { Loader, Message } from "semantic-ui-react";

import ContainerTable from "../../layout/ContainersTable";

import { fetchContainers } from "../actions/daemon";

import { IDaemon } from "../types/daemon";
import { IContainer } from "../../Group/types/group";

interface IDaemonContainersProps {
  daemon: IDaemon;
}

interface IDaemonContainersStates {
  containers: IContainer[];
  isFetching: boolean;
  error: Error;
}

class Daemon extends React.Component<
  IDaemonContainersProps,
  IDaemonContainersStates
> {
  public state = {
    containers: [],
    isFetching: false,
    error: Error()
  };

  public componentWillMount() {
    const { daemon } = this.props;

    const fetch = () => {
      fetchContainers(daemon._id)
        .then((containers: IContainer[]) => this.setState({ containers }))
        .catch((error: Error) => this.setState({ error, isFetching: false }));
    };

    fetch();
    setInterval(fetch, 1000 * 5);
  }

  public render() {
    const { containers, error, isFetching } = this.state;
    const { daemon } = this.props;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>
            There was an issue to connect to the Docker daemon
          </Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return <ContainerTable daemon={daemon} containers={containers} />;
  }
}

export default Daemon;
