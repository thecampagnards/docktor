import * as React from 'react';
import { Button, Icon, Popup } from 'semantic-ui-react';

import { status } from '../../constants/container';
import { changeContainersStatus } from '../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../Daemon/types/daemon';
import {
    changeContainersStatus as changeGroupContainersStatus, createContainer
} from '../Group/actions/group';
import { IGroup } from '../Group/types/group';

interface IContainersButtonsProps {
  daemon?: IDaemon;
  group?: IGroup;
  container: IContainer;
}

interface IContainersButtonsStates {
  isFetching: boolean;
  error: Error;
}

export default class ContainersButtons extends React.Component<IContainersButtonsProps, IContainersButtonsStates> {

  public state = {
    isFetching: false,
    error: Error()
  }

  public render() {
    const { container } = this.props;
    const { isFetching, error } = this.state;

    if (container.Status) {
      return <Popup
        content={error.message}
        disabled={!error.message}
        inverted={true}
        trigger={
          <Button.Group fluid={true}>
            <Button
              loading={isFetching}
              icon={true}
              color="green"
              disabled={status.Started.indexOf(container.State) > -1}
              onClick={this.handleOnClick.bind(this, "start")}
            ><Icon name="play" /> START</Button>
            <Button
              loading={isFetching}
              icon={true}
              color="orange"
              disabled={status.Stopped.indexOf(container.State) > -1}
              onClick={this.handleOnClick.bind(this, "stop")}
            ><Icon name="stop" /> STOP</Button>
            <Button
              loading={isFetching}
              icon={true}
              color="red"
              disabled={status.Removed.indexOf(container.State) > -1}
              onClick={this.handleOnClick.bind(this, "remove")}
            ><Icon name="delete" /> DELETE</Button>
          </Button.Group>}
      />
    }

    return <Popup
      content={error.message}
      disabled={!error}
      inverted={true}
      trigger={<Button
        loading={isFetching}
        icon={true}
        color="green"
        disabled={status.Started.indexOf(container.State) > -1}
        onClick={this.handleOnClick.bind(this, "create")}
      ><Icon name="cog" /> CREATE</Button>}
    />
  }

  private handleOnClick = (state: string) => {
    const { container, daemon, group } = this.props;

    this.setState({ isFetching: true })

    if (group) {
      if (state === "create") {
        createContainer(group._id, container.Id)
          .catch(error => this.setState({ error }))
          .finally(() => this.setState({ isFetching: false }))
        return
      }

      changeGroupContainersStatus(
        group._id,
        state,
        [container.Id]
      )
        .catch(error => this.setState({ error }))
        .finally(() => this.setState({ isFetching: false }))
      return
    }

    if (daemon) {
      changeContainersStatus(
        daemon._id,
        state,
        [container.Id]
      )
        .catch(error => this.setState({ error }))
        .finally(() => this.setState({ isFetching: false }))
    }
  }
}
