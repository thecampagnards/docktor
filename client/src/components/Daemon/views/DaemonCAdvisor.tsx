import * as React from 'react';
import { Button, Grid, Icon, Loader, Message, Progress, Divider, Segment } from 'semantic-ui-react';

import { fetchCadvisor } from '../actions/daemon';
import { IDaemon } from '../types/daemon';
import DaemonServiceButtons from './DaemonServiceButtons';
import { IResources } from 'src/components/Home/types/home';

interface IDaemonCAdvisorProps {
  daemon: IDaemon;
}

interface IDaemonCAdvisorStates {
  resources: IResources;
  isFetching: boolean;
  error: Error;
}

class DaemonCAdvisor extends React.Component<
  IDaemonCAdvisorProps,
  IDaemonCAdvisorStates
> {
  public state = {
    daemon: {} as IDaemon,
    resources: {} as IResources,
    isFetching: true,
    error: Error()
  };

  private refreshIntervalId: NodeJS.Timeout;

  public componentWillMount() {
    const { daemon } = this.props;

    const fetch = () => {
      fetchCadvisor(daemon._id)
        .then((resources: IResources) =>
          this.setState({ resources, error: Error() })
        )
        .catch((error: Error) => {
          this.setState({ error });
        })
        .finally(() => {
          this.setState({ isFetching: false });
        });
    };

    fetch();
    this.refreshIntervalId = setInterval(fetch, 1000 * 5);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshIntervalId);
  }

  public render() {
    const {
      resources,
      error,
      isFetching
    } = this.state;

    const { daemon } = this.props;

    const buttons = <DaemonServiceButtons daemon={daemon} services={["cadvisor"]} />

    if (error.message) {
      return (
        <>
          <Message negative={true}>
            <Message.Header>
              There was an issue with your CAdvisor
            </Message.Header>
            <p>{error.message}</p>
          </Message>
          {buttons}
        </>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <>
        <Grid>
          <Grid.Column width={10}>
            <Button icon={true} labelPosition="right" as="a" title={daemon.cadvisor} href={daemon.cadvisor} target="_blank">
              <Icon name="external alternate" /> Open cAdvisor webpage
            </Button>
          </Grid.Column>
          <Grid.Column width={6}>
            {buttons}
          </Grid.Column>
        </Grid>
        <Divider/>
        <h4>Resources</h4>
        <Segment raised={true}>
          <Progress
            value={resources.cpu}
            total={100}
            progress="percent"
            label="CPU"
            className="reverse"
          />
          <Progress
            value={resources.ram}
            total={100}
            progress="percent"
            label="RAM"
            className="reverse"
          />
        </Segment>
        {resources.fs.length > 0 && (
          <>
            <Divider/>
            <h4>Filesystems</h4>
          </>
        )}
        {resources.fs
            .sort((a,b) => a.device.localeCompare(b.device))
            .map(s => {
          const capGo = Math.round(s.capacity/1000000)/1000;
          const usageGo = Math.round(s.usage/1000000)/1000;
          const percent = Math.round(100*usageGo/capGo);
          return (
            <Segment key={s.device}>
              <Progress
                value={percent}
                total={100}
                progress="percent"
                label={"Disk - " + s.device}
                title={`${usageGo}/${capGo}Go`}
                className="reverse"
              />
            </Segment>
          );
        })}
      </>
    );
  }
}

export default DaemonCAdvisor;
