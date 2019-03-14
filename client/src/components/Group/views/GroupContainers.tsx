import * as React from 'react';
import { Loader, Message } from 'semantic-ui-react';
import ContainerTable from 'src/components/layout/ContainersTable';

import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import { fetchContainers } from '../actions/group';
import { IGroup } from '../types/group';

interface IGroupProps {
  group: IGroup;
  daemon: IDaemon;
}

interface IGroupStates {
  containers: IContainer[];
  isFetching: boolean;
  error: Error;
}

class GroupContainers extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    containers: [],
    isFetching: true,
    error: Error()
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
