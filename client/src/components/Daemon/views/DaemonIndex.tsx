import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { RouteComponentProps } from 'react-router';
import { Message, Tab, TabProps } from 'semantic-ui-react';

import { path as constPath } from '../../../constants/path';
import { fetchDaemon } from '../../Daemon/actions/daemon';
import { IDaemon } from '../../Daemon/types/daemon';
import DaemonCAdvisor from './DaemonCAdvisor';
import DaemonContainers from './DaemonContainers';
import DaemonForm from './DaemonForm';
import DaemonSSH from './DaemonSSH';

interface IRouterProps {
  daemonID: string;
}

interface IDaemonIndexStates {
  daemon: IDaemon;
  isFetching: boolean;
  error: Error;
  activeTab: number;
}

class DaemonIndex extends React.Component<
  RouteComponentProps<IRouterProps>,
  IDaemonIndexStates
  > {
  public state = {
    activeTab: 0,
    isFetching: false,
    daemon: {} as IDaemon,
    error: Error()
  };

  public componentWillMount() {
    const { daemonID } = this.props.match.params;
    const path = window.location.pathname;

    fetchDaemon(daemonID)
      .then((daemon: IDaemon) => this.setState({ daemon }))
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    let activeTab: number;
    switch (true) {
      case path === constPath.daemonsContainers.replace(":daemonID", daemonID):
        activeTab = 0;
        break;
      case path === constPath.daemonsCAdvisor.replace(":daemonID", daemonID):
        activeTab = 1;
        break;
      case path === constPath.daemonsEdit.replace(":daemonID", daemonID):
        activeTab = 2;
        break;
      case path === constPath.daemonsSSH.replace(":daemonID", daemonID):
        activeTab = 3;
        break;
      default:
        activeTab = 0;
    }

    this.setState({ activeTab });
  }

  public render() {
    const { error, daemon, activeTab, isFetching } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>There was an issue to get daemon</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    const panes = [
      {
        menuItem: "Containers",
        pane: (
          <Tab.Pane loading={isFetching} key={1}>
            {daemon._id && <DaemonContainers daemon={daemon} />}
          </Tab.Pane>
        )
      },
      {
        menuItem: "CAdvisor",
        pane: (
          <Tab.Pane loading={isFetching} key={2}>
            {daemon._id && <DaemonCAdvisor daemon={daemon} />}
          </Tab.Pane>
        )
      },
      {
        menuItem: "Edit",
        pane: (
          <Tab.Pane loading={isFetching} key={3}>
            {daemon._id && <DaemonForm daemon={daemon} />}
          </Tab.Pane>
        )
      },
      {
        menuItem: "SSH",
        pane: (
          <Tab.Pane loading={isFetching} key={4}>
            {daemon._id && <DaemonSSH daemon={daemon} />}
          </Tab.Pane>
        )
      }
    ];

    return (
      <>
        <h1>{daemon.Name || "Daemon"}</h1>
        <ReactMarkdown source={daemon.Description} />
        <Tab
          panes={panes}
          renderActiveOnly={false}
          defaultActiveIndex={activeTab}
          onTabChange={this.changeTab}
        />
      </>
    );
  }

  private changeTab = (
    event: React.MouseEvent<HTMLDivElement>,
    data: TabProps
  ) => {
    const { daemonID } = this.props.match.params;
    switch (data.activeIndex) {
      case 0:
        this.props.history.push(
          constPath.daemonsContainers.replace(":daemonID", daemonID)
        );
        break;
      case 1:
        this.props.history.push(
          constPath.daemonsCAdvisor.replace(":daemonID", daemonID)
        );
        break;
      case 2:
        this.props.history.push(
          constPath.daemonsEdit.replace(":daemonID", daemonID)
        );
        break;
      case 3:
        this.props.history.push(
          constPath.daemonsSSH.replace(":daemonID", daemonID)
        );
        break;
    }
  };
}

export default DaemonIndex;
