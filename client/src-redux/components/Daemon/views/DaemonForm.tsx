import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Loader } from "semantic-ui-react";

import { IDaemon } from '../types/daemon';

import Layout from '../../layout/layout';

interface IRouterProps {
  daemonID: string;
}

interface IDaemonFormStates {
  daemon: IDaemon | null;
  isFetching: boolean;
}

export class DaemonForm extends React.Component<RouteComponentProps<IRouterProps>, IDaemonFormStates> {

  public componentWillMount() {
    const { daemonID } = this.props.match.params
  }

  public render() {

    const { daemon, isFetching } = this.state;

    if (isFetching) {
      return (
        <Layout>
          <h2>Daemon</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>Daemon EDIT {JSON.stringify(daemon)}</Layout>
    );
  }
}
