import * as _ from 'lodash';
import * as React from 'react';
import { Grid, Label, Loader, Message } from 'semantic-ui-react';

import { defaultDaemonServices } from '../../../constants/constants';
import { IContainer } from '../../Daemon/types/daemon';
import ContainersGrid from '../../layout/ContainersView/ContainersGrid';
import { fetchComposeServices, fetchContainers, fetchSavedContainers } from '../actions/daemon';
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
  private savedContainers: IContainer[] = [] as IContainer[];

  public componentDidMount() {
    const { daemon } = this.props;

    fetchComposeServices(daemon._id).then(services =>
      this.setState({ services })
    );

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
          <Grid.Column width={10}>
            NETWORKS :{" "}
            {_.uniq(containers.map(c => c.HostConfig.NetworkMode)).map(n => (
              <Label key={n}>{n}</Label>
            ))}
          </Grid.Column>
          <Grid.Column width={6}>
            <DaemonServiceButtons daemon={daemon} services={services} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <ContainersGrid
              daemon={daemon}
              containers={containers}
              admin={true}
              refresh={this.fetch}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
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

export default Daemon;
