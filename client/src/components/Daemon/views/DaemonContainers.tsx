import * as _ from "lodash";
import * as React from 'react';
import { Loader, Message, Grid } from 'semantic-ui-react';

import { defaultDaemonServices } from '../../../constants/constants';
import { IContainer } from '../../Daemon/types/daemon';
import ContainerTable from '../../layout/ContainersTables/ContainersTables';
import { fetchComposeServices, fetchContainers } from '../actions/daemon';
import { IDaemon } from '../types/daemon';
import DaemonServiceButtons from './DaemonServiceButtons';

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
    containers: [] as IContainer[],
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
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <h4>{"NETWORKS - " + _.uniq(containers.map(c => c.HostConfig.NetworkMode)).join(" / ")}</h4>
          </Grid.Column>
          <Grid.Column width={8}>
            <DaemonServiceButtons daemon={daemon} services={services} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <ContainerTable daemon={daemon} containers={containers} admin={true} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default Daemon;
