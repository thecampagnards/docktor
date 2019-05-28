import * as React from 'react';
import { Grid, Dropdown, Message, Loader, Card, Progress } from 'semantic-ui-react';
import { IProfile } from 'src/components/User/types/user';
import { IHomeData, IEnvironment } from '../types/home';
import { fetchHome } from '../actions/home';

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
                clearable={true}
                label="Environment"
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
                  <Card fuild={true}>
                    <Card.Content>
                      <Progress percent={70} className="reverse" />
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
}

export default Home
