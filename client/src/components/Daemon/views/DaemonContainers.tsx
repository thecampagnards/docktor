import * as React from 'react';
import { Loader, Message } from 'semantic-ui-react';

import { IContainer } from '../../Daemon/types/daemon';
import ContainersGrid from '../../layout/ContainersView/ContainersGrid';
import { fetchContainers, fetchSavedContainers } from '../actions/daemon';
import { IDaemon } from '../types/daemon';
import { IGroup } from '../../Group/types/group';

interface IDaemonContainersProps {
  daemon: IDaemon;
  groups: IGroup[];
}

interface IDaemonContainersStates {
  containers: IContainer[];
  isFetching: boolean;
  error: Error;
}

class DaemonContainers extends React.Component<
  IDaemonContainersProps,
  IDaemonContainersStates
> {
  public state = {
    containers: [] as IContainer[],
    isFetching: true,
    error: Error()
  };

  private refreshIntervalId: NodeJS.Timeout;
  private savedContainers: IContainer[] = [] as IContainer[];

  public componentDidMount() {
    const { daemon } = this.props;

    fetchSavedContainers(daemon._id)
      .then(savedContainers => {
        this.savedContainers = savedContainers;
        this.fetch()
      })
      .catch(error => this.setState({ error }));

    this.refreshIntervalId = setInterval(this.fetch, 1000 * 5);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshIntervalId);
  }

  public render() {
    const { containers, error, isFetching } = this.state;
    const { daemon, groups } = this.props;

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

    return (
      <ContainersGrid
        daemon={daemon}
        containers={containers}
        admin={true}
        refresh={this.fetch}
        groups={groups}
      />
    );
  }

  private fetch = () => {
    fetchContainers(this.props.daemon._id)
      .then((containers: IContainer[]) => {
        if (this.savedContainers) {
          for (const container of this.savedContainers) {
            if (
              !containers.find(
                c => c.Names && c.Names.indexOf(container.Name) !== -1
              )
            ) {
              containers.push(container);
            }
          }
        }
        this.setState({ containers, error: Error() });
      })
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };
}

export default DaemonContainers;
