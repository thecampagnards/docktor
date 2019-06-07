import * as React from 'react';
import { Grid, Dropdown, Message, Loader, Card, Progress, Icon, Modal, Button } from 'semantic-ui-react';
import { IProfile } from 'src/components/User/types/user';
import { IHomeData, IEnvironment } from '../types/home';
import { fetchHome } from '../actions/home';
import TextSocket from 'src/components/layout/TextSocket';
import { path } from 'src/constants/path';

interface IHomeState {
  user: IProfile;
  groups: string[];
  current: IEnvironment;
  isFetching: boolean;
  error: Error;
}

class Home extends React.Component<{}, IHomeState> {
  public state = {
    user: {} as IProfile,
    groups: [] as string[],
    current: {} as IEnvironment,
    isFetching: true,
    error: Error()
  }

  public componentWillMount() {
    fetchHome()
      .then((data: IHomeData) => {
        const groups = data.environments.map(env => env.group.name);
        if (groups.length === 0) {
          this.setState({ groups })
        } else {
          const current = data.environments[0];
          this.setState({ groups, current })
        }        
      })
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { groups, current, isFetching, error} = this.state;

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

    if (groups.length === 0) {
      return (
        <>
          <h2>Home</h2>
          No group available
        </>
      )
    }

    const filesystem = current.resources.fs[0];
    const fsUsage = Math.round(100 * filesystem.usage / filesystem.capacity);

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
                name="envID"
                placeholder="Select environment"
                defaultValue={current.group.name}
                options={groups.map(g => {
                  return { text: g, value: g };
                })}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            {current.group._id && (
              <>
                <Grid.Column width={8}>
                  <Card fluid={true}>
                    <Card.Content>
                      <a href={path.groupCAdvisor.replace(":groupID", current.group._id)}>
                        <Icon name="microchip" color="green" size="big" title={current.resources.cpu} bordered={true} floated="left" />
                      </a>
                      <a href={path.groupCAdvisor.replace(":groupID", current.group._id)}>
                        <Icon name="server" color="orange" size="big" title={current.resources.ram} bordered={true} floated="left" />
                      </a>
                      <a href={path.groupCAdvisor.replace(":groupID", current.group._id)}>
                        <Icon name="hdd" style={{backgroundColor: this.computeColor(fsUsage)}} size="big" title={fsUsage} bordered={true} floated="left" />
                        <Progress percent={fsUsage} className="reverse" title={fsUsage} />
                      </a>
                      
                      {current.containers.filter(c => c.State === "exited").map(c => (
                          <Modal trigger={<Button color="red" content={c.Names[0]} labelPosition="left" icon="wheelchair" />}>
                            <Modal.Content style={{ background: "black", color: "white" }}>
                              <pre style={{ whiteSpace: "pre-line" }}>
                                <TextSocket wsPath={`/api/daemons/${current.daemon._id}/docker/containers/${c.Id}/log`} />
                              </pre>
                            </Modal.Content>
                          </Modal>
                      ))}
                    </Card.Content>
                  </Card>
                </Grid.Column>
              </>
            )}
          </Grid.Row>
        </Grid>
      </>
    )
  }

  private computeColor = (percent: number) => {
    switch (Math.round(percent/10)) {
      default:
        return "D95C5C";
    }
  }
}

export default Home
