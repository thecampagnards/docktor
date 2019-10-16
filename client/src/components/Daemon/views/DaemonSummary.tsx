import * as _ from 'lodash';
import * as React from 'react';
import { Grid, Label, Loader, Message, Card, Button } from 'semantic-ui-react';

import { defaultDaemonServices } from '../../../constants/constants';
import { IContainer } from '../../Daemon/types/daemon';
import { fetchComposeServices } from '../actions/daemon';
import { IDaemon } from '../types/daemon';
import DaemonServiceButtons from './DaemonServiceButtons';
import { IGroup } from '../../Group/types/group';

interface IDaemonSummaryProps {
  daemon: IDaemon;
  groups: IGroup[];
}

interface IDaemonSummaryStates {
  containers: IContainer[];
  isFetching: boolean;
  error: Error;
  services: string[];
}

class DaemonSummary extends React.Component<
  IDaemonSummaryProps,
  IDaemonSummaryStates
> {
  public state = {
    containers: [] as IContainer[],
    isFetching: true,
    error: Error(),
    services: defaultDaemonServices
  };

  public componentDidMount() {
    this.fetch();
  }

  public render() {
    const { services, containers, error, isFetching } = this.state;
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
      return <Loader active={true}>Loading daemon</Loader>;
    }

    return (
      <Grid columns="3">
        {services.map(ds => (
          <Grid.Column key={ds}>
            <Card fluid={true}>
              <Card.Header>{ds.toUpperCase()}</Card.Header>
              <Card.Content>
                <Button color="green" content="Start" />
              </Card.Content>
            </Card>
          </Grid.Column>
        ))}
      </Grid>
    );
  }

  private fetch = () => {
    const { daemon } = this.props;
    fetchComposeServices(daemon._id)
      .then(services =>
        this.setState({ services })
      )
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };
}

export default DaemonSummary;
