import * as React from "react";
import { Tab, TabProps } from "semantic-ui-react";
import { RouteComponentProps } from "react-router";

import Layout from "../../layout/layout";
import { path as constPath } from "../../../constants/path";

import { fetchGroup } from "../actions/group";
import { fetchDaemon } from "src/components/Daemon/actions/daemon";
import { IGroup } from "../types/group";
import { IDaemon } from "../../Daemon/types/daemon";

import GroupContainers from "./GroupContainers";
import GroupServices from "./GroupServices";
import GroupForm from "./GroupForm";

interface IRouterProps {
  groupID: string;
}

interface IGroupIndexStates {
  group: IGroup;
  daemon: IDaemon;
  isFetching: boolean;
  error: Error;
  activeTab: number;
}

class GroupIndex extends React.Component<
  RouteComponentProps<IRouterProps>,
  IGroupIndexStates
> {
  public state = {
    activeTab: 0,
    isFetching: false,
    group: {} as IGroup,
    daemon: {} as IDaemon,
    error: {} as Error
  };

  public componentWillMount() {
    const { groupID } = this.props.match.params;
    const path = window.location.pathname;

    fetchGroup(groupID)
      .then((group: IGroup) => {
        this.setState({ group });

        fetchDaemon(group.DaemonID).then((daemon: IDaemon) =>
          this.setState({ daemon, isFetching: false })
        );
      })
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    let activeTab: number;
    switch (true) {
      case path === constPath.groupsServices.replace(":groupID", groupID):
        activeTab = 0;
        break;
      case path === constPath.groupsContainers.replace(":groupID", groupID):
        activeTab = 1;
        break;
      case path === constPath.groupsEdit.replace(":groupID", groupID):
        activeTab = 2;
        break;
      default:
        activeTab = 0;
    }

    this.setState({ activeTab });
  }

  public render() {
    const { group, daemon, activeTab, isFetching } = this.state;

    const panes = [
      {
        menuItem: "Services",
        pane: (
          <Tab.Pane loading={isFetching} key={1}>
            {group._id &&
              daemon._id && <GroupServices group={group} daemon={daemon} />}
          </Tab.Pane>
        )
      },
      {
        menuItem: "Containers",
        pane: (
          <Tab.Pane loading={isFetching} key={2}>
            {group._id &&
              daemon._id && <GroupContainers group={group} daemon={daemon} />}
          </Tab.Pane>
        )
      },
      {
        menuItem: "Edit",
        pane: (
          <Tab.Pane loading={isFetching} key={3}>
            {group._id && daemon._id && <GroupForm group={group} />}
          </Tab.Pane>
        )
      }
    ];

    return (
      <Layout>
        <h1>{group !== null ? group.Name : "Group"}</h1>
        <Tab
          panes={panes}
          renderActiveOnly={false}
          defaultActiveIndex={activeTab}
          onTabChange={this.changeTab}
        />
      </Layout>
    );
  }

  private changeTab = (
    event: React.MouseEvent<HTMLDivElement>,
    data: TabProps
  ) => {
    const { groupID } = this.props.match.params;
    switch (data.activeIndex) {
      case 0:
        this.props.history.push(
          constPath.groupsServices.replace(":groupID", groupID)
        );
        break;
      case 1:
        this.props.history.push(
          constPath.groupsContainers.replace(":groupID", groupID)
        );
        break;
      case 2:
        this.props.history.push(
          constPath.groupsEdit.replace(":groupID", groupID)
        );
        break;
    }
  };
}
export default GroupIndex;
