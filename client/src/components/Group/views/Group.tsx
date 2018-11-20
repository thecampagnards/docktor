import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Loader } from "semantic-ui-react";

import { IGroup } from '../types/group';
import { fetchGroup } from '../actions/group';

import Layout from '../../layout/layout';
import { fetchDaemon } from '../../Daemon/actions/daemon';
import { IDaemon } from '../../Daemon/types/daemon';

interface IRouterProps {
  groupID: string;
}

interface IGroupStates {
  group: IGroup | null;
  daemon: IDaemon | null;
  isFetching: boolean;
  error: Error | null;
}

class Group extends React.Component<RouteComponentProps<IRouterProps>, IGroupStates> {
  
  public state = {
    group: null,
    daemon: null,
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { groupID } = this.props.match.params
    fetchGroup(groupID)
    .then((group: IGroup) => this.setState({group, isFetching: false}))


    fetchGroup(groupID)
      .then((group: IGroup) => {
        this.setState({group})
        fetchDaemon(group.DaemonID).then(
          (daemon: IDaemon) => this.setState({daemon, isFetching: false})
        )
      })
      .catch((error: Error) => this.setState({error, isFetching: false}))
  }

  public render() {

    const { daemon, group, error, isFetching } = this.state;

    if (!group) {
      return (
        <Layout>
          <h2>Group</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }
  
    if (error) {
      return (
        <Layout>
          <h2>Group</h2>
          <p>{error}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Group</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h2>Group</h2>
        <p>{JSON.stringify(group)}</p>
        <p>{JSON.stringify(daemon)}</p>
      </Layout>
    );
  }
}

export default Group;
