import * as React from 'react';
import { Button, Loader, Message } from 'semantic-ui-react';

import { fetchDaemon } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import ContainerTable from '../../layout/ContainersTable';
import { fetchContainers, saveContainers } from '../actions/group';
import { IGroup } from '../types/group';

interface IGroupProps {
  group: IGroup;
  admin: boolean;
}

interface IGroupStates {
  daemon: IDaemon;
  containers: IContainer[];
  isFetching: boolean;
  error: Error;

  isSaveFetching: boolean;
  saveError: Error;
}

class GroupContainers extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    daemon: {} as IDaemon,
    containers: [],
    isFetching: true,
    error: Error(),

    isSaveFetching: false,
    saveError: Error(),
  };

  private refreshIntervalId: NodeJS.Timeout;

  public componentWillMount() {
    const { group } = this.props;

    fetchDaemon(group.DaemonID)
      .then((daemon: IDaemon) => this.setState({ daemon }))
      .catch((error: Error) => this.setState({ error }));

    const fetch = () => {
      fetchContainers(group._id)
        .then((containers: IContainer[]) => {
          for (const container of group.Containers) {
            if (!containers.find((c) => c.Names.indexOf(container.Name) !== -1)) {
              containers.push(container)
            }
          }
          this.setState({ isFetching: false, containers, error: Error() })
        })
        .catch((error: Error) => this.setState({ error, isFetching: false }));
    }

    fetch();
    this.refreshIntervalId = setInterval(fetch, 1000 * 5);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshIntervalId);
  }

  public render() {
    const { group, admin } = this.props;
    const { daemon, containers, saveError, error, isFetching, isSaveFetching } = this.state;

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
      return <Loader active={true} />;
    }

    return (
      <>
        {saveError.message &&
          <Message negative={true}>
            <Message.Header>
              There was an issue to save Docker containers
          </Message.Header>
            <p>{saveError.message}</p>
          </Message>
        }
        {containers && containers.length > 0 && (
          <Button 
            color="teal" 
            icon="save" 
            labelPosition="right" 
            content="SAVE CONTAINERS" 
            onClick={this.handleSaveContainer} 
            loading={isSaveFetching} 
            floated="right" 
          />
        )}
        <ContainerTable daemon={daemon} containers={containers} group={group} admin={admin} />
      </>
    );
  }

  private handleSaveContainer = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    this.setState({ isSaveFetching: true })
    saveContainers(this.props.group._id)
      .catch(saveError => this.setState({ saveError }))
      .finally(() => this.setState({ isSaveFetching: false }))
  }
}

export default GroupContainers;
