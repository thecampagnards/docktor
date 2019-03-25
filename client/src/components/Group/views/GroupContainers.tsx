import * as React from 'react';
import { Loader, Message } from 'semantic-ui-react';

import { fetchDaemon } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import ContainerTable from '../../layout/ContainersTable';
import { fetchContainers } from '../actions/group';
import { IGroup } from '../types/group';

interface IGroupProps {
  group: IGroup;
}

interface IGroupStates {
  daemon: IDaemon;
  containers: IContainer[];
  isFetching: boolean;
  error: Error;
}

class GroupContainers extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    daemon: {} as IDaemon,
    containers: [],
    isFetching: true,
    error: Error()
  };

  public componentWillMount() {
    const { group } = this.props;

    fetchDaemon(group.DaemonID)
      .then((daemon: IDaemon) => this.setState({ daemon }))
      .catch((error: Error) => this.setState({ error }));

    fetchContainers(group._id)
      .then((containers: IContainer[]) =>
        this.setState({ isFetching: false, containers })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { daemon, containers, error, isFetching } = this.state;

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

export default GroupContainers;
