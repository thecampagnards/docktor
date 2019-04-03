import * as React from 'react';
import { Loader, Message } from 'semantic-ui-react';

import { defaultDaemonServices } from '../../../constants/constants';
import { IContainer } from '../../Daemon/types/daemon';
import ContainerTable from '../../layout/ContainersTable';
import { fetchComposeServices, fetchContainers } from '../actions/daemon';
import { IDaemon } from '../types/daemon';
import { serviceButton } from './DaemonServiceButtons';

interface IDaemonContainersProps {
  daemon: IDaemon;
}

interface IDaemonContainersStates {
  containers: IContainer[];
  isFetching: boolean;
  error: Error;
  services: string[];
}

class Daemon extends React.Component<
  IDaemonContainersProps,
  IDaemonContainersStates
> {
  public state = {
    containers: [],
    isFetching: true,
    error: Error(),
    services: defaultDaemonServices
  };

  private refreshIntervalId: NodeJS.Timeout;

  public componentWillMount() {
    const { daemon } = this.props;

    fetchComposeServices(daemon._id).then(services =>
      this.setState({ services })
    );

    const fetch = () => {
      fetchContainers(daemon._id)
        .then(containers => this.setState({ containers, error: Error() }))
        .catch(error => this.setState({ error }))
        .finally(() => this.setState({ isFetching: false }));
    };

    fetch();
    this.refreshIntervalId = setInterval(fetch, 1000 * 5);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshIntervalId);
  }

  public render() {
    const { services, containers, error, isFetching } = this.state;
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

    return (
      <>
        {serviceButton(daemon, services)}
        <ContainerTable daemon={daemon} containers={containers} admin={true} />
      </>
    );
  }
}

export default Daemon;
