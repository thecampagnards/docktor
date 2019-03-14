import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Loader, Message } from 'semantic-ui-react';

import { fetchService } from '../actions/service';
import { IService } from '../types/service';

interface IRouterProps {
  serviceID: string
}

interface IServiceStates {
  service: IService
  isFetching: boolean
  error: Error
}

class Service extends React.Component<RouteComponentProps<IRouterProps>, IServiceStates> {

  public state = {
    service: {} as IService,
    isFetching: true,
    error: Error()
  }

  public componentWillMount() {
    const { serviceID } = this.props.match.params
    fetchService(serviceID)
      .then((service) => this.setState({ service, isFetching: false }))
      .catch((error) => this.setState({ error, isFetching: false }))
  }

  public render() {

    const { service, error, isFetching } = this.state

    if (error.message) {
      return (
        <>
          <h2>Service</h2>
          <Message negative={true}>
            <Message.Header>
              There was an issue
          </Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      )
    }

    if (isFetching) {
      return (
        <>
          <h2>Service</h2>
          <Loader active={true} />
        </>
      )
    }

    return (
      <>
        <h2>Service</h2>
        <p>{JSON.stringify(service)}</p>
      </>
    )
  }
}

export default Service
