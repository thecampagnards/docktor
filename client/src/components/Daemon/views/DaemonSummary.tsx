import * as _ from 'lodash';
import * as React from 'react';
import { Grid, Loader, Message, Card, Button, Segment, Menu, Icon } from 'semantic-ui-react';

import { defaultDaemonServices } from '../../../constants/constants';
import { IContainer, dockerStatus } from '../../Daemon/types/daemon';
import { fetchComposeServices } from '../actions/daemon';
import { IDaemon } from '../types/daemon';
import { IGroup } from '../../Group/types/group';
import { Link } from 'react-router-dom';
import { path } from '../../../constants/path';

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
      <>
        {this.statusMsg}
        <Menu compact={true}>
          <Menu.Item header={true}>GROUPS</Menu.Item>
          {groups && groups.map(g => (
            <Menu.Item key={g._id} name={g.name} as={Link} to={path.groupsServices.replace(":groupID", g._id)} />
          ))}
        </Menu>
        <Segment>
          <Grid columns="3">
            {services.map(ds => (
              <Grid.Column key={ds}>
                <Card fluid={true}>
                  <Card.Content>
                    <Card.Header>{ds.toUpperCase()}</Card.Header>
                  </Card.Content>
                  <Card.Content>
                    <Button color="green" content="Start" />
                  </Card.Content>
                </Card>
              </Grid.Column>
            ))}
          </Grid>
        </Segment>
      </>
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

  private getDockerStatus = () => {
    const status = this.props.daemon.docker.status;
    switch (status) {
      case "OK":
        return (
          <Message icon={true} positive={true}>
            <Icon color="green" name="check circle" />
            <Message.Content>Docker daemon is up and running</Message.Content>
          </Message>
        );
      case "CERT":
        return (
          <Message icon={true} warning={true}>
            <Icon color="yellow" name="check circle outline" />
            <Message.Content>Daemon certs are or will be outdated soon</Message.Content>
          </Message>
        );
      case "OLD":
        return (
          <Message icon={true} color="orange">
            <Icon color="orange" name="warning sign" />
            <Message.Content>Daemon's Docker version is incompatible with Docktor</Message.Content>
          </Message>
        );
      case "":
        return (
          <Message icon={true}>
            <Icon color="black" name="question circle" />
            <Message.Content>No status info</Message.Content>
          </Message>
        );
      default:
        return (
          <Message icon={true} negative={true}>
            <Icon color="red" name="close" />
            <Message.Content>Daemon is down/unreachable</Message.Content>
          </Message>
        );
    }
  };
  private statusMsg = this.getDockerStatus();
}

export default DaemonSummary;
