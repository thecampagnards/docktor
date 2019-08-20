import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Button, Card, Dropdown, DropdownProps, Grid, Icon, List, Loader, Message, Modal, Segment, Divider
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import TextSocket from '../../layout/TextSocket';
import { fetchHome } from '../actions/home';
import { IEnvironment, IHomeData } from '../types/home';
import './Home.css';

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

    if (environments.length === 0) {
      return (
        <>
          <h2>Home</h2>
          <Divider />
          <Message info={true}>
            <Message.Header>No group available</Message.Header>
            <Message.Content>You are not assigned to any CDK environment. Follow the user manual to get started.</Message.Content>
          </Message>
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
            <Grid.Column width={14}>
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
          </Grid.Row>
            {envSelected.map(env => {
              const exitedContainers = env.containers.filter(c => c.State === "exited");
              const filesystem = env.resources.fs[0];
              const fsUsage = Math.round(
                (100 * filesystem.usage) / filesystem.capacity
              );
              return (
                <Grid.Column width={8} key={env.group.name}>
                  <Card fluid={true}>
                    <Card.Content>
                      <Segment
                        as={Link}
                        to={path.groupCAdvisor.replace(
                          ":groupID",
                          env.group._id
                        )}
                        floated="right"
                      >
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
                          data-percent={fsUsage}
                          name="hdd"
                          className="reverse"
                          size="big"
                          title={`Disk : ${fsUsage}%`}
                        />
                      </Segment>
                      <Card.Header>{env.group.name}</Card.Header>
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
                      {exitedContainers.length === 0 ?
                      <Card.Description>
                        <Icon name="check" color="green" />
                        All containers are up and running
                      </Card.Description>
                      :
                      <List>
                        {exitedContainers.map(c => (
                            <List.Item key={c.Id}>
                              <List.Content>
                                <Button
                                  compact={true}
                                  basic={true}
                                  color="green"
                                  labelPosition="right"
                                  icon="fire extinguisher"
                                  content="Restart"
                                  floated="right"
                                />
                              </List.Content>
                              <List.Content>
                                <Icon circular={true} color="red" name="fire" />
                                <Modal
                                  trigger={
                                    <Button basic={true} compact={true} circular={true} labelPosition="right" icon="align left" content={c.Names[0].replace("/", "")} />
                                  }
                                  className="logs-modal"
                                >
                                  <Modal.Content
                                    style={{
                                      background: "black",
                                      color: "white"
                                    }}
                                  >
                                    <pre style={{ whiteSpace: "pre-line" }}>
                                      <TextSocket
                                        wsPath={`/api/daemons/${env.daemon._id}/docker/containers/${c.Id}/log`}
                                      />
                                    </pre>
                                  </Modal.Content>
                                </Modal>
                              </List.Content>
                            </List.Item>
                          ))}
                      </List>
                      }
                    </Card.Content>
                  </Card>
                </Grid.Column>
              );
            })}
        </Grid>
      </>
    );
  }

  private handleSelect = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    const { environments } = this.state;
    const groups = data.value as string[];

    let envSelected = environments.filter(e => groups.includes(e.group.name));
    if (envSelected.length === 0) {
      envSelected = environments;
    }

    const hidden = environments
      .filter(e => !envSelected.includes(e))
      .map(e => e.group.name);
    localStorage.setItem("home", JSON.stringify(hidden));

    this.setState({ envSelected });
  };
}

export default Home;
