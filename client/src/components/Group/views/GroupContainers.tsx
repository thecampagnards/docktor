import * as React from "react";
import { Loader } from "semantic-ui-react";

import ContainerTable from "src/components/layout/ContainersTable";
import { fetchContainers } from "../actions/group";

import { IGroup, IContainer } from "../types/group";
import { IDaemon } from "../../Daemon/types/daemon";

interface IGroupProps {
  group: IGroup;
  daemon: IDaemon;
}

interface IGroupStates {
  containers: IContainer[];
  isFetching: boolean;
  error: Error | null;
}

class GroupContainers extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    containers: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { group } = this.props;

    fetchContainers(group._id)
      .then((containers: IContainer[]) => this.setState({ containers }))
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { daemon } = this.props;
    const { containers, error, isFetching } = this.state;

    if (!containers) {
      return <p>No data yet ...</p>;
    }

    if (error) {
      return <p>{(error as Error).message}</p>;
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return <ContainerTable daemon={daemon} containers={containers} />;
  }
}

export default GroupContainers;
