import * as React from 'react';
import { Loader, Message, Progress, Segment } from 'semantic-ui-react';

import { IFileSystem, IResources } from '../../Home/types/home';
import { fetchCadvisor } from '../actions/group';
import { IGroup } from '../types/group';

interface IGroupCAdvisorProps {
  group: IGroup;
  admin: boolean;
}

interface IGroupCAdvisorStates {
  resources: IResources;
  isFetching: boolean;
  error: Error;
}

class GroupCAdvisor extends React.Component<
  IGroupCAdvisorProps,
  IGroupCAdvisorStates
> {
  public state = {
    resources: {} as IResources,
    isFetching: true,
    error: Error()
  };

  private refreshIntervalId: NodeJS.Timeout;

  public componentDidMount() {
    const { group } = this.props;

    const fetch = () => {
      fetchCadvisor(group._id)
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
    this.refreshIntervalId = setInterval(fetch, 1000 * 10);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshIntervalId);
  }

  public render() {
    const { resources, error, isFetching } = this.state;

    if (error.message) {
      return (
        <>
          <Message negative={true}>
            <Message.Header>There was an issue with CAdvisor</Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    const filesystem = {
      device: "No group filesystem found.",
      capacity: 0,
      usage: 0
    } as IFileSystem;

    if (resources.fs[0]) {
      const fsUsageGo = Math.round(resources.fs[0].usage / 1000000000);
      const fsCapGo = Math.round(resources.fs[0].capacity / 1000000000);
      const deviceText = `FileSystem`;
      filesystem.device = deviceText;
      filesystem.capacity = fsCapGo;
      filesystem.usage = fsUsageGo;
    }

    return (
      <>
        <Segment>
          <Progress
            value={resources.cpu}
            total={100}
            progress="percent"
            label="CPU"
            className="reverse"
          />
        </Segment>
        <Segment>
          <Progress
            value={resources.ram}
            total={100}
            progress="percent"
            label="RAM"
            className="reverse"
          />
        </Segment>
        <Segment>
          <Progress
            value={filesystem.usage}
            total={filesystem.capacity}
            progress="percent"
            label={filesystem.device}
            title={`${filesystem.usage}/${filesystem.capacity}Go`}
            className="reverse"
          />
        </Segment>
      </>
    );
  }
}

export default GroupCAdvisor;
