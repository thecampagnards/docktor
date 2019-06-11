import * as React from 'react';
import { Grid, Dropdown, Message, Loader, Card, Icon, Modal, Button, Segment, List } from 'semantic-ui-react';
import { IProfile } from 'src/components/User/types/user';
import { IHomeData, IEnvironment } from '../types/home';
import { fetchHome } from '../actions/home';
import TextSocket from 'src/components/layout/TextSocket';
import { path } from 'src/constants/path';

interface IHomeState {
  user: IProfile;
  environments: IEnvironment[];
  isFetching: boolean;
  error: Error;
}

class Home extends React.Component<{}, IHomeState> {
  public state = {
    user: {} as IProfile,
    environments: [] as IEnvironment[],
    isFetching: true,
    error: Error()
  }

  public componentWillMount() {
    fetchHome()
      .then((data: IHomeData) => {
        const environments = data.environments;
        this.setState({ environments });
      })
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { environments, isFetching, error } = this.state;

    if (error.message) {
      return (
        <>
          <h2>Home</h2>
          <Message negative={true}>
            <Message.Header>Failed to load home page with error :</Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      )
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
          No group available
        </>
      )
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
                placeholder="Select environment"
                options={environments.map(e => {
                  return { text: e.group.name, value: e.group.name };
                })}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            {environments.map(env => {
              const filesystem = env.resources.fs[0];
              const fsUsage = Math.round(100 * filesystem.usage / filesystem.capacity);
              return (
              <Grid.Column width={8} key={env.group.name}>
                <Card fluid={true}>
                  <Card.Content>
                    <Segment as="a" href={path.groupCAdvisor.replace(":groupID", env.group._id)} floated="right">
                      <Icon 
                        name="microchip" 
                        style={{ color: this.computeColor(env.resources.cpu) }} 
                        size="big" 
                        title={`CPU : ${env.resources.cpu}%`}
                      />
                      <Icon 
                        name="server" 
                        style={{ color: this.computeColor(env.resources.ram) }} 
                        size="big" 
                        title={`RAM : ${env.resources.ram}%`}
                      />
                      <Icon 
                        name="hdd" 
                        style={{ color: this.computeColor(fsUsage) }} 
                        size="big" 
                        title={`Disk : ${fsUsage}%`}
                      />
                    </Segment>
                    <Card.Header>{env.group.name}</Card.Header>
                    <Card.Meta>{env.daemon.host}</Card.Meta>
                    <Card.Description>
                      <a href={path.groupsContainers.replace(":groupID", env.group._id)}>
                        Go to containers
                      </a>
                    </Card.Description>
                  </Card.Content>
                  <Card.Content>
                    <List>
                    {env.containers.filter(c => c.State === "exited").map(c => (
                      <List.Item>
                        <List.Content>
                        <Button compact={true} basic={true} color="green" labelPosition="right" icon="fire extinguisher" content="Restart" floated="right" />
                        </List.Content>
                        <List.Content>
                        <Icon circular={true} color="red" name="fire" />
                          <Modal trigger={<a>{c.Names[0].replace("/","")}</a>}>
                            <Modal.Content style={{ background: "black", color: "white" }}>
                              <pre style={{ whiteSpace: "pre-line" }}>
                                <TextSocket wsPath={`/api/daemons/${env.daemon._id}/docker/containers/${c.Id}/log`} />
                              </pre>
                            </Modal.Content>
                          </Modal>
                        </List.Content>
                      </List.Item>
                    ))}
                    </List>
                  </Card.Content>
                </Card>
              </Grid.Column>
              );
            })}
          </Grid.Row>
        </Grid>
      </>
    )
  }

  private computeColor = (percent: number) => {
    switch (Math.round(percent / 10)) {
      case 1:
        return "#66DA81";
      case 2:
        return "#66DA81";
      case 3:
        return "#B4D95C";
      case 4:
        return "#B4D95C";
      case 5:
        return "#DDC928";
      case 6:
        return "#DDC928";
      case 7:
        return "#EFBC72";
      case 8:
        return "#EFBC72";
      case 9:
        return "#D95C5C";
      default:
        return "#B5B5B5";
    }
  }
}

export default Home
