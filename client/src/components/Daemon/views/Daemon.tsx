import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Loader } from "semantic-ui-react";

import { IDaemon } from '../types/daemon';
import { fetchDaemon } from '../actions/daemon';

import Layout from '../../layout/layout';

interface IRouterProps {
  daemonID: string;
}

interface IDaemonStates {
  daemon: IDaemon | null;
  isFetching: boolean;
  error: Error | null;
}

class Daemon extends React.Component<RouteComponentProps<IRouterProps>, IDaemonStates> {
  
  public state = {
    daemon: null,
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { daemonID } = this.props.match.params
    fetchDaemon(daemonID)
    .then((daemon: IDaemon) => this.setState({daemon, isFetching: false}))
    .catch((error: Error) => this.setState({ error, isFetching: false }))
  }

  public render() {

    const { daemon, error, isFetching } = this.state;

    if (!daemon) {
      return (
        <Layout>
          <h2>Daemon</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }
  
    if (error) {
      return (
        <Layout>
          <h2>Daemon</h2>
          <p>{error}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Daemon</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h2>Daemon</h2>
        <p>{JSON.stringify(daemon)}</p>
      </Layout>
    );
  }
}

export default Daemon;
