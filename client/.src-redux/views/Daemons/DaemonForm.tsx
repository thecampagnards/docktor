import * as React from 'react';
import { connect, Dispatch } from "react-redux";
import { RouteComponentProps } from 'react-router';
import { Loader } from "semantic-ui-react";

import { IStoreState } from "../../types/store";
import { fetchDaemonThunk } from "../../actions/daemon";
import { IDaemon } from '../../types/model';

import Layout from '../../components/layout/layout';

interface IRouterProps {
  daemonID: string;
}

interface IDispatchProps {
  daemon: IDaemon | null;
  isFetching: boolean;
  fetchDaemon: (daemonID: string) => void;
}

class DaemonForm extends React.Component<RouteComponentProps<IRouterProps> & IDispatchProps> {

  public componentWillMount() {
    const { daemonID } = this.props.match.params
    this.props.fetchDaemon(daemonID);
  }

  public render() {

    const { daemon, isFetching } = this.props;

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

const mapStateToProps = (state: IStoreState) => {
  const { daemon } = state;
  return {
    daemon: daemon.daemon || null,
    isFetching: !!daemon.isFetching
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IStoreState>) => {
  return {
    fetchDaemon: (daemonID: string) => {
      dispatch(fetchDaemonThunk(daemonID));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DaemonForm);
