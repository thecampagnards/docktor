import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { RouteComponentProps } from 'react-router';
import { Message, Tab, TabProps } from 'semantic-ui-react';

import { path as constPath } from '../../../constants/path';
import { fetchGroup } from '../actions/group';
import { IGroup } from '../types/group';
import GroupCAdvisor from './GroupCAdvisor';
import GroupContainers from './GroupContainers';
import GroupMembers from './GroupMembers';
import GroupForm from './GroupForm';
import GroupServices from './GroupServices';

interface IRouterProps {
  groupID: string;
}

interface IGroupIndexStates {
  group: IGroup;
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
    error: Error()
  };

  public componentWillMount() {
    const { groupID } = this.props.match.params;
    const path = window.location.pathname;

    fetchGroup(groupID)
      .then((group: IGroup) => {
        this.setState({ group });
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
      case path === constPath.groupsMembers.replace(":groupID", groupID):
        activeTab = 2;
        break;
      case path === constPath.groupCAdvisor.replace(":groupID", groupID):
        activeTab = 3;
        break;
      case path === constPath.groupsEdit.replace(":groupID", groupID):
        activeTab = 4;
        break;
      default:
        activeTab = 0;
    }

    this.setState({ activeTab });
  }

  public render() {
    const { group, activeTab, isFetching, error } = this.state;

    if (error.message) {
      return (
        <>
          <h1>Group</h1>
          <Message negative={true}>
            <Message.Header>Failed to load data with error :</Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    const panes = [
      {
        menuItem: "Services",
        pane: (
          <Tab.Pane loading={isFetching} key={1}>
            {group._id && <GroupServices group={group} />}
          </Tab.Pane>
        )
      },
      {
        menuItem: "Containers",
        pane: (
          <Tab.Pane loading={isFetching} key={2}>
            {group._id && <GroupContainers group={group} />}
          </Tab.Pane>
        )
      },
      {
        menuItem: "Members",
        pane: (
          <Tab.Pane loading={isFetching} key={3}>
            {group._id && <GroupMembers group={group} />}
          </Tab.Pane>
        )
      },
      {
        menuItem: "CAdvisor",
        pane: (
          <Tab.Pane loading={isFetching} key={4}>
            {group._id && <GroupCAdvisor group={group} />}
          </Tab.Pane>
        )
      },
      {
        menuItem: "Edit",
        pane: (
          <Tab.Pane loading={isFetching} key={5}>
            {group._id && <GroupForm group={group} />}
          </Tab.Pane>
        )
      }
    ];

    return (
      <>
        <h1>{group.Name || "Group"}</h1>
        <ReactMarkdown source={group.Description} escapeHtml={false} />
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
          constPath.groupsMembers.replace(":groupID", groupID)
        );
        break;
      case 3:
        this.props.history.push(
          constPath.groupCAdvisor.replace(":groupID", groupID)
        );
        break;
      case 4:
        this.props.history.push(
          constPath.groupsEdit.replace(":groupID", groupID)
        );
        break;
    }
  };
}

export default GroupIndex;
