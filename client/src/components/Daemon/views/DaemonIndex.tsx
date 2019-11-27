import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { RouteComponentProps } from 'react-router';
import { Loader, Message, Tab, TabProps } from 'semantic-ui-react';

import { path as constPath } from '../../../constants/path';
import { fetchDaemon } from '../../Daemon/actions/daemon';
import { IDaemon } from '../../Daemon/types/daemon';
import DaemonCAdvisor from './DaemonCAdvisor';
import DaemonContainers from './DaemonContainers';
import DaemonForm from './DaemonForm';
import DaemonSSH from './DaemonSSH';
import { IGroup } from '../../Group/types/group';
import { fetchGroupsByDaemon } from '../../Group/actions/group';
import DaemonSummary from './DaemonSummary';

interface IRouterProps {
  daemonID: string;
}

interface IDaemonIndexStates {
  daemon: IDaemon;
  isFetching: boolean;
  error: Error;
  activeTab: number;
  groups: IGroup[];
}

class DaemonIndex extends React.Component<
  RouteComponentProps<IRouterProps>,
  IDaemonIndexStates
> {
  public state = {
    activeTab: 0,
    isFetching: true,
    daemon: {} as IDaemon,
    error: Error(),
    groups: [] as IGroup[]
  };

  public componentDidMount() {
    const { daemonID } = this.props.match.params;
    const path = window.location.pathname;

    fetchDaemon(daemonID)
      .then((daemon: IDaemon) => {
        this.setState({ daemon, isFetching: false });
        fetchGroupsByDaemon(daemon._id).then(groups => this.setState({ groups }));
      })
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    let activeTab: number;
    switch (true) {
      case path === constPath.daemonsSummary.replace(":daemonID", daemonID):
        activeTab = 0;
        break;
      case path === constPath.daemonsContainers.replace(":daemonID", daemonID):
        activeTab = 1;
        break;
      case path === constPath.daemonsCAdvisor.replace(":daemonID", daemonID):
        activeTab = 2;
        break;
      case path === constPath.daemonsEdit.replace(":daemonID", daemonID):
        activeTab = 3;
        break;
      case path === constPath.daemonsSSH.replace(":daemonID", daemonID):
        activeTab = 4;
        break;
      default:
        activeTab = 0;
    }

    this.setState({ activeTab });
  }

  public render() {
    const { error, daemon, activeTab, isFetching, groups } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>There was an issue to get daemon</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    const panes = [
      {
        menuItem: "Summary",
        pane: (
          <Tab.Pane
            loading={isFetching} key={0}>
            <DaemonSummary daemon={daemon} groups={groups} />
          </Tab.Pane>
        )
      },
      {
        menuItem: "Containers",
        pane: (
          <Tab.Pane
            loading={isFetching}
            key={1}
            disabled={!daemon.docker || !daemon.docker.port}
          >
            <DaemonContainers daemon={daemon} groups={groups} />
          </Tab.Pane>
        )
      },
      {
        menuItem: "CAdvisor",
        pane: (
          <Tab.Pane loading={isFetching} key={2}>
            <DaemonCAdvisor daemon={daemon} />
          </Tab.Pane>
        )
      },
      {
        menuItem: "Edit",
        pane: (
          <Tab.Pane loading={isFetching} key={3}>
            <DaemonForm daemon={daemon} history={this.props.history} />
          </Tab.Pane>
        )
      },
      {
        menuItem: "SSH",
        pane: (
          <Tab.Pane
            loading={isFetching}
            key={4}
            disabled={!daemon.ssh || !daemon.ssh.port}
          >
            <DaemonSSH daemon={daemon} />
          </Tab.Pane>
        )
      }
    ];

    return (
      <>
        <h2>{daemon ? "Daemon : " + daemon.name : "Unknown daemon"}</h2>
        <ReactMarkdown source={daemon.description} escapeHtml={false} />
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
          constPath.daemonsSummary.replace(":daemonID", daemonID)
        );
        break;
      case 1:
        this.props.history.push(
          constPath.daemonsContainers.replace(":daemonID", daemonID)
        );
        break;
      case 2:
        this.props.history.push(
          constPath.daemonsCAdvisor.replace(":daemonID", daemonID)
        );
        break;
      case 3:
        this.props.history.push(
          constPath.daemonsEdit.replace(":daemonID", daemonID)
        );
        break;
      case 4:
        this.props.history.push(
          constPath.daemonsSSH.replace(":daemonID", daemonID)
        );
        break;
    }
  };
}

export default DaemonIndex;
