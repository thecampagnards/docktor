import * as React from "react";
import { Tab } from "semantic-ui-react";

import Layout from "../../layout/layout";
import { RouteComponentProps } from "react-router";
import { path as constPath } from "../../../constants/path";
import { fetchGroup } from "../actions/group";
import { fetchDaemon } from "src/components/Daemon/actions/daemon";
import { IGroup } from "../types/group";
import { IDaemon } from "src/components/Daemon/types/daemon";
import GroupContainers from './GroupContainers';

interface IGroupIndexStates {
  group: IGroup | null;
  daemon: IDaemon | null;
  isFetching: boolean;
  error: Error | null;
}

class GroupIndex extends React.Component<
  RouteComponentProps,
  IGroupIndexStates
> {

  public state = {
    group: null,
    daemon: null,
    containers: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const path = this.props.location.pathname;
    const groupID = path.split("/")[2];

    fetchGroup(groupID)
      .then((group: IGroup) => {
        this.setState({ group });

        fetchDaemon(group.DaemonID).then((daemon: IDaemon) =>
          this.setState({ daemon, isFetching: false })
        );
      })
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { group, daemon, isFetching } = this.state;
    const path = this.props.location.pathname;

    const panes = [
      {
        menuItem: "Services",
      pane: <Tab.Pane loading={isFetching}>{group !== null && daemon !== null && <GroupContainers group={group!} daemon={daemon!}/>}</Tab.Pane>
      },
      {
        menuItem: "Containers",
        pane: <Tab.Pane loading={isFetching}>Tab 3 Content</Tab.Pane>
      },
      {
        menuItem: "Edit",
        pane: <Tab.Pane loading={isFetching}>Tab 2 Content</Tab.Pane>
      }
    ];

    let activeTab: number;
    switch (true) {
      case path.indexOf(constPath.groupsMore) > -1:
        activeTab = 0;
        break;
      case path.indexOf(constPath.groupsMore) > -1:
        activeTab = 1;
        break;
      default:
        activeTab = 0;
    }

    return (
      <Layout>
        <Tab
          panes={panes}
          renderActiveOnly={false}
          defaultActiveIndex={activeTab}
        />
      </Layout>
    );
  }
}
export default GroupIndex;
