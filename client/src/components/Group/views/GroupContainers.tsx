import * as React from 'react';
import { Message, Loader } from 'semantic-ui-react';

import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import ContainersGrid from '../../layout/ContainersView/ContainersGrid';
import { fetchContainers } from '../actions/group';
import { IGroup } from '../types/group';

interface IGroupProps {
  group: IGroup;
  admin: boolean;
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

  private refreshIntervalId: NodeJS.Timeout;

  public componentDidMount() {
    this.fetch();
    this.refreshIntervalId = setInterval(this.fetch, 1000 * 60);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshIntervalId);
  }

  public render() {
    const { group, daemon, admin } = this.props;
    const { containers, isFetching, error } = this.state;

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
      return (
        <Loader content="Loading containers" />
      );
    }

    return (
      <ContainersGrid
        containers={containers}
        admin={admin}
        daemon={daemon}
        groupId={group._id}
        refresh={this.fetch}
      />
    );
  }

  private fetch = () => {
    fetchContainers(this.props.group._id)
      .then((containers: IContainer[]) => {
        if (!containers) {
          containers = [] as IContainer[];
        }
        for (const container of this.props.group.containers) {
          if (
            !containers.find(
              c => c.Names && c.Names.includes(container.Name)
            )
          ) {
            containers.push(container);
          }
        }
        this.setState({ containers, error: Error() });
      })
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };
}

export default GroupContainers;
