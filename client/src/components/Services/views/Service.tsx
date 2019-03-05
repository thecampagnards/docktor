import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Loader } from "semantic-ui-react";

import { IService } from '../types/service';
import { fetchService } from '../actions/service';

import Layout from '../../layout/layout';

interface IRouterProps {
  serviceID: string;
}

interface IServiceStates {
  service: IService | null;
  isFetching: boolean;
  error: Error | null;
}

class Service extends React.Component<RouteComponentProps<IRouterProps>, IServiceStates> {

  public state = {
    service: null,
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { serviceID } = this.props.match.params
    fetchService(serviceID)
    .then((service: IService) => this.setState({service, isFetching: false}))
    .catch((error: Error) => this.setState({ error, isFetching: false }))
  }

  public render() {

    const { service, error, isFetching } = this.state;

    if (!service) {
      return (
        <Layout>
          <h2>Service</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }

    if (error) {
      return (
        <Layout>
          <h2>Service</h2>
          <p>{(error as Error).message}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Service</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h2>Service</h2>
        <p>{JSON.stringify(service)}</p>
      </Layout>
    );
  }
}

export default Service;
