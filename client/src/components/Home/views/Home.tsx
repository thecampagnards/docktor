import './Home.css';

import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Card, Divider, Dropdown, DropdownProps, Grid, Icon, Loader, Message,
    Segment,
    Button
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { fetchHome } from '../actions/home';
import { IEnvironment, IHomeData } from '../types/home';
import { dockerStatus } from '../../Daemon/types/daemon';

interface IHomeState {
  environments: IEnvironment[];
  envSelected: IEnvironment[];
  isFetching: boolean;
  error: Error;
}

class Home extends React.Component<{}, IHomeState> {
  public state = {
    environments: [] as IEnvironment[],
    envSelected: [] as IEnvironment[],
    isFetching: true,
    error: Error()
  };

  public componentDidMount() {
    const hidden = JSON.parse(localStorage.getItem("home") || "[]") as string[];

    fetchHome()
      .then((data: IHomeData) => {
        const environments = data.environments;
        const envSelected = environments.filter(
          e => !hidden.includes(e.group.name)
        );
        this.setState({ environments, envSelected });
      })
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { environments, envSelected, isFetching, error } = this.state;

    if (error.message) {
      return (
        <>
          <h2>Home</h2>
          <Message negative={true}>
            <Message.Header>
              Failed to load home page with error :
            </Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    if (isFetching) {
      return (
        <>
          <h2>Groups</h2>
          <Loader active={true} />
        </>
      );
    }

    return (
      <>
        <Grid>
          <Grid.Row>
            <Grid.Column width={2}>
              <h2>Home</h2>
            </Grid.Column>
            <Grid.Column width={10}>
              <Dropdown
                selection={true}
                multiple={true}
                name="group"
                placeholder="Select environments"
                options={environments.map(e => {
                  return { text: e.group.name, value: e.group.name };
                })}
                value={envSelected.map(e => e.group.name)}
                onChange={this.handleSelect}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <Button
                basic={true}
                labelPosition="left"
                icon="book"
                content="Docktor user manual"
                floated="right"
                as="a"
                href="https://docs-qualif.cdk.corp.sopra/start/docktor/" // TODO get url from config
                target="_blank"
              />
            </Grid.Column>
          </Grid.Row>
          {envSelected.map(env => (
            <Grid.Column width={8} key={env.group.name}>
              <Card fluid={true}>
                <Card.Content>
                  <Segment
                    as={Link}
                    to={path.groupsCAdvisor.replace(":groupID", env.group._id)}
                    floated="right"
                  >
                    {env.resources === null ? (
                      <Icon
                        name="warning circle"
                        className="reverse"
                        size="big"
                        title="CAdvisor info not available"
                        color="red"
                      />
                    ) : (
                      <>
                        <Icon
                          data-percent={env.resources.cpu}
                          name="microchip"
                          className="reverse"
                          size="big"
                          title={`CPU : ${env.resources.cpu}%`}
                        />
                        <Icon
                          data-percent={env.resources.ram}
                          name="server"
                          className="reverse"
                          size="big"
                          title={`RAM : ${env.resources.ram}%`}
                        />
                        <Icon
                          data-percent={Math.round(
                            (100 * env.resources.fs[0].usage) /
                              env.resources.fs[0].capacity
                          )}
                          name="hdd"
                          className="reverse"
                          size="big"
                          title={`Disk : ${Math.round(
                            (100 * env.resources.fs[0].usage) /
                              env.resources.fs[0].capacity
                          )}%`}
                        />
                      </>
                    )}
                  </Segment>
                  <Card.Header as={Link} to={path.groupsServices.replace(":groupID", env.group._id)}>{env.group.name}</Card.Header>
                  <Card.Meta>{env.daemon.host}</Card.Meta>
                  <Card.Description>
                    <Link
                      to={path.groupsContainers.replace(
                        ":groupID",
                        env.group._id
                      )}
                    >
                      <Icon name="docker" /> Go to containers
                    </Link>
                  </Card.Description>
                </Card.Content>
                <Card.Content>
                  {env.daemon.docker.status && this.daemonStatus(env.daemon.docker.status)}
                </Card.Content>
                <Card.Content>
                  {env.containers === null ? (
                    <Card.Description>
                      <Icon name="fire" color="red" />
                      Error when getting containers. Click the link above to see the detail.
                    </Card.Description>
                  ) : env.containers.filter(c => c.State === "exited")
                      .length === 0 ? (
                    <Card.Description>
                      <Icon name="check circle" color="green" />
                      All containers are running.
                    </Card.Description>
                  ) : (
                    <Card.Description>
                      <Icon name="warning sign" color="orange" />
                      There are exited containers that may cause unavailable services. Click the link above to restart them if needed.
                    </Card.Description>
                  )}
                </Card.Content>
              </Card>
            </Grid.Column>
          ))}
        </Grid>
        <Divider />
        {environments.length === 0 && (
          <Message info={true}>
            <Message.Header>No group available</Message.Header>
            <Message.Content>
              You are not assigned to any CDK environment. Follow the user
              manual to get started.
            </Message.Content>
          </Message>
        )}
      </>
    );
  }

  private handleSelect = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    const { environments } = this.state;
    const groups = data.value as string[];

    const envSelected = environments.filter(e => groups.includes(e.group.name));

    const hidden = environments
      .filter(e => !envSelected.includes(e))
      .map(e => e.group.name);
    localStorage.setItem("home", JSON.stringify(hidden));

    this.setState({ envSelected });
  };

  private daemonStatus = (status: dockerStatus) => {
    switch (status) {
      case "OK":
        return (
          <Card.Description>
            <Icon color="green" name="check circle" /> Docker daemon is up
          </Card.Description>
        );
      case "CERT":
        return (
          <Card.Description>
            <Icon color="yellow" name="check circle outline" /> Daemon certs are or will be outdated soon
          </Card.Description>
        );
      case "OLD":
        return (
          <Card.Description>
            <Icon color="orange" name="warning sign" /> Daemon's Docker version is incompatible with Docktor
          </Card.Description>
        );
      case "":
        return (
          <Card.Description>
            <Icon color="black" name="question circle" /> No status info
          </Card.Description>
        );
      default:
        return (
          <Card.Description>
            <Icon color="red" name="fire" /> Daemon is down/unreachable
          </Card.Description>
        );
    }
  };
}

export default Home;
