import * as React from "react";
import { Loader } from "semantic-ui-react";

import ContainerTable from "src/components/layout/ContainersTable";

import { fetchContainers } from "../actions/daemon";

import { IDaemon } from "../types/daemon";
import { IContainer } from "../../Group/types/group";

interface IDaemonContainersProps {
  daemon: IDaemon;
}

interface IDaemonContainersStates {
  containers: IContainer[];
  isFetching: boolean;
  error: Error | null;
}

class Daemon extends React.Component<
  IDaemonContainersProps,
  IDaemonContainersStates
> {
  public state = {
    daemon: {} as IDaemon,
    containers: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { daemon } = this.props;

    setInterval(() => {
      fetchContainers(daemon._id)
        .then((containers: IContainer[]) => this.setState({ containers }))
        .catch((error: Error) => this.setState({ error, isFetching: false }));
    }, 1000 * 5);
  }

  public render() {
    const { containers, daemon, error, isFetching } = this.state;

    if (error) {
      return <p>{error}</p>;
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return <ContainerTable daemon={daemon} containers={containers} />;
  }
}

export default Daemon;
