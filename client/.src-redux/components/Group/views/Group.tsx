import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { IGroup } from '../types/group';
import { fetchGroup } from "../actions/group";

import Layout from '../../layout/layout';

import { IDaemon } from '../../Daemon/types/daemon';
import { fetchDaemon } from '../../Daemon/actions/daemon';

interface IRouterProps {
  groupID: string;
}

interface IGroupStates {
  group: IGroup;
  daemon: IDaemon;
}

class Group extends React.Component<RouteComponentProps<IRouterProps>, IGroupStates> {


  public componentDidMount(){
    const { groupID } = this.props.match.params

    fetchGroup(groupID)
      .then((group: IGroup) => this.setState({group}))
      .then(() => {
          fetchDaemon(this.state.group.DaemonID).then((daemon: IDaemon) => this.setState({daemon}))
      })
          /*.catch((error: Error) => {
            this.setState({
              message: error.message
            });
          });
      })*/
     // .catch((error: Error) => this.setState({error}));
  }

  public render() {
    const { group } = this.state;
    if (group){
      return (
        <Layout>Group toto</Layout>
      );
    }
    return (
      <Layout>Group </Layout>
    );
  }
}

export default Group;
