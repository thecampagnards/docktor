import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Message, Menu, Container, Divider } from 'semantic-ui-react';

import { path as constPath, path } from '../../../constants/path';
import { IStoreState } from '../../../types/store';
import { fetchDaemon } from '../../Daemon/actions/daemon';
import { IDaemon } from '../../Daemon/types/daemon';
import { fetchGroup } from '../actions/group';
import { IGroup } from '../types/group';
import GroupCAdvisor from './GroupCAdvisor';
import GroupContainers from './GroupContainers';
import GroupForm from './GroupForm';
import GroupMembers from './GroupMembers';
import GroupServices from './GroupServices';
import GroupSummary from './GroupSummary';

interface IRouterProps {
  groupID: string;
}

interface IGroupIndexProps {
  username: string;
  isAdmin: boolean;
}

interface IGroupIndexStates {
  group: IGroup;
  daemon: IDaemon;
  isFetching: boolean;
  error: Error;
  view: JSX.Element;
  activeItem: string;
  groupAdmin: boolean;
}

class GroupIndex extends React.Component<
  RouteComponentProps<IRouterProps> & IGroupIndexProps,
  IGroupIndexStates
> {
  public state = {
    isFetching: true,
    group: {} as IGroup,
    daemon: {} as IDaemon,
    error: Error(),
    view: <Container />,
    activeItem: "",
    groupAdmin: false
  };

  public constructor(
    props: RouteComponentProps<IRouterProps> & IGroupIndexProps
  ) {
    super(props);

    this.refreshGroup();
  }

  public render() {
    const { group, view, activeItem, error } = this.state;
    const admin = this.props.isAdmin || this.state.groupAdmin;

    if (error.message) {
      return (
        <>
          <h2>Group</h2>
          <Message negative={true}>
            <Message.Header>Failed to load data with error :</Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    return (
      <>
        <Menu borderless={true} fluid={true} widths={6} pointing={true}>
          <Menu.Item
            header={true}
            color="blue"
            name={group.name}
            onClick={this.handleTabSwitch.bind(this, path.groupsSummary.replace(":groupID", group._id))}
            active={activeItem === "summary"}
          />
          <Menu.Item
            icon="cubes"
            name="SERVICES"
            onClick={this.handleTabSwitch.bind(this, path.groupsServices.replace(":groupID", group._id))}
            active={activeItem === "services"}
          />
          <Menu.Item
            icon="block layout"
            name="CONTAINERS"
            onClick={this.handleTabSwitch.bind(this, path.groupsContainers.replace(":groupID", group._id))}
            active={activeItem === "containers"}
          />
          <Menu.Item
            icon="users"
            name="MEMBERS"
            onClick={this.handleTabSwitch.bind(this, path.groupsMembers.replace(":groupID", group._id))}
            active={activeItem === "members"}
          />
          <Menu.Item
            icon="server"
            name="CADVISOR"
            onClick={this.handleTabSwitch.bind(this, path.groupsCAdvisor.replace(":groupID", group._id))}
            active={activeItem === "cadvisor"}
          />
          <Menu.Item
            icon="cog"
            name="SETTINGS"
            onClick={this.handleTabSwitch.bind(this, path.groupsEdit.replace(":groupID", group._id))}
            active={activeItem === "edit"}
            disabled={!admin}
          />
        </Menu>

        <Divider />

        {view}
      </>
    );
  }

  private handleTabSwitch = (path: string) => {
    this.props.history.push(path);
    this.refreshJSX(path);
  };

  private refreshGroup = () => {
    const { groupID } = this.props.match.params;
    const { username } = this.props;

    groupID &&
    fetchGroup(groupID)
      .then((group: IGroup) => {
        this.setState({ group, groupAdmin: (group.admins && group.admins.includes(username)) });
        group.daemon_id &&
          fetchDaemon(group.daemon_id).then((daemon: IDaemon) => {
            this.setState({ daemon });
            this.refreshJSX(window.location.pathname);
          });
      })
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };

  private refreshJSX = (path: string) => {
    const { daemon, group, groupAdmin} = this.state;
    const { username, isAdmin } = this.props;

    switch (true) {
      case path === constPath.groupsServices.replace(":groupID", group._id):
        this.setState({ 
          view: <GroupServices group={group} admin={isAdmin} groupAdmin={isAdmin || groupAdmin} />,
          activeItem: "services"
        });
        break;
      case path === constPath.groupsContainers.replace(":groupID", group._id):
        this.setState({
          view: <GroupContainers group={group} admin={isAdmin} daemon={daemon} />,
          activeItem: "containers"
        });
        break;
      case path === constPath.groupsMembers.replace(":groupID", group._id):
        this.setState({
          view: <GroupMembers history={this.props.history} group={group} admin={groupAdmin || isAdmin} username={username} refresh={this.refreshGroup} />,
          activeItem: "members"
        });
        break;
      case path === constPath.groupsCAdvisor.replace(":groupID", group._id):
        this.setState({
          view: <GroupCAdvisor group={group} />,
          activeItem: "cadvisor"
        });
        break;
      case path === constPath.groupsEdit.replace(":groupID", group._id):
        this.setState({
          view: <GroupForm group={group} isAdmin={isAdmin} history={this.props.history} />,
          activeItem: "edit"
        });
        break;
      default:
        this.setState({
          view: <GroupSummary group={group} daemon={daemon} admin={isAdmin} indexRefresh={this.handleTabSwitch} />,
          activeItem: "summary"
        });
    };
  }
}

const mapStateToProps = (state: IStoreState) => {
  const { login } = state;
  return {
    username: login.username || "",
    isAdmin: login.isAdmin
  };
};

export default connect(mapStateToProps)(GroupIndex);
