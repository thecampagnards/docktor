import * as React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Loader, Message, Card, Button, Segment, Menu, Icon, ButtonProps } from 'semantic-ui-react';

import { fetchComposeServices, getComposeStatus, changeComposeStatus } from '../actions/daemon';
import { IDaemon } from '../types/daemon';
import { IGroup, IContainerStatus } from '../../Group/types/group';
import { path } from '../../../constants/path';

interface IDaemonSummaryProps {
  daemon: IDaemon;
  groups: IGroup[];
}

interface IDaemonSummaryStates {
  isFetching: boolean;
  error: Error;
  services: string[];
  status: IContainerStatus[];
  isFetchingStatus: string;
}

class DaemonSummary extends React.Component<
  IDaemonSummaryProps,
  IDaemonSummaryStates
> {
  public state = {
    isFetching: true,
    error: Error(),
    services: [] as string[],
    status: [] as IContainerStatus[],
    isFetchingStatus: "all",
  };

  public componentDidMount() {
    const { daemon } = this.props;

    fetchComposeServices(daemon._id)
      .then(services => {
        this.setState({ services });
        this.refreshStatus(daemon);
      })
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
    
  }

  public render() {
    const { services, status, error, isFetching } = this.state;
    const { groups } = this.props;

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
            {services.map(s => {
              const state = status.filter(cs => cs.Name.includes(s));
              return (
                <Grid.Column key={s}>
                  <Card fluid={true}>
                    <Card.Content>
                      {state.map(cs => this.statusIndicator(cs))}
                      <Card.Header>{s.toUpperCase()}</Card.Header>
                    </Card.Content>
                    <Card.Content>
                      {this.buttonStatus(s, state)}
                    </Card.Content>
                  </Card>
                </Grid.Column>
              );
            })}
          </Grid>
        </Segment>
      </>
    );
  }

  private statusIndicator = (cs: IContainerStatus) => {
    switch (true) {
      case cs.State.startsWith("Up"):
        return (
          <Icon
            key={cs.Name}
            className="float-right"
            color="green"
            circular={true}
            name="circle"
            title={`Container ${cs.Name} is running`}
          />
        );
      case cs.State.startsWith("Exited"):
        return (
          <Icon
            key={cs.Name}
            className="float-right"
            color="red"
            circular={true}
            name="circle"
            title={`Container ${cs.Name} is not running`}
          />
        );
      default:
        return (
          <Icon
            key={cs.Name}
            className="float-right"
            color="grey"
            circular={true}
            name="circle"
            title={`Container ${cs.Name} : ${cs.State}`}
          />
        );
    }
  };

  private buttonStatus = (service: string, status: IContainerStatus[]) => {
    const { isFetchingStatus } = this.state;

    const buttonStart = (
      <Button
        basic={true}
        circular={true}
        color="green"
        icon="play"
        labelPosition="right"
        loading={isFetchingStatus === "all" || isFetchingStatus === service}
        content="Start"
        name={service}
        status="start"
        onClick={this.updateServiceStatus}
      />
    );
    const buttonStop = (
      <Button
        basic={true}
        circular={true}
        color="orange"
        icon="stop"
        labelPosition="right"
        loading={isFetchingStatus === "all" || isFetchingStatus === service}
        content="Stop"
        name={service}
        status="stop"
        onClick={this.updateServiceStatus}
      />
    );
    const buttonDelete = (
      <Button
        basic={true}
        circular={true}
        color="red"
        icon="delete"
        loading={isFetchingStatus === "all" || isFetchingStatus === service}
        title="Remove containers"
        name={service}
        status="remove"
        onClick={this.updateServiceStatus}
      />
    );

    switch (true) {
      case status.length === 0:
        return (
          <Button
            floated="right"
            basic={true}
            circular={true}
            color="blue"
            icon="sliders"
            labelPosition="right"
            loading={isFetchingStatus === "all" || isFetchingStatus === service}
            content="Create"
            name={service}
            status="start"
            onClick={this.updateServiceStatus}
          />
        );
      case status.length === status.filter(s => s.State.startsWith("Up")).length:
        return (
          <>
            {buttonStop}
            {buttonDelete}
          </>
        );
      default:
        return (
          <>
            {buttonStart}
            {buttonDelete}
          </>
        );
    }
  };

  private refreshStatus = (daemon: IDaemon) => {
    const services = this.state.services;
    getComposeStatus(daemon._id, services)
      .then((status: IContainerStatus[]) => this.setState({ status }))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetchingStatus: "" }));
  };

  private updateServiceStatus = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    { name, status }: ButtonProps
  ) => {
    const { daemon } = this.props;
    const services: string[] = [name];
    this.setState({ isFetchingStatus: name });
    changeComposeStatus(daemon._id, status, services)
      .then(() => this.refreshStatus(daemon))
      .catch(error => this.setState({ error }));
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
            <Icon color="red" name="fire" />
            <Message.Content>Daemon is down/unreachable</Message.Content>
          </Message>
        );
    }
  };
  private statusMsg = this.getDockerStatus();
}

export default DaemonSummary;
