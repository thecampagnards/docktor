import * as React from 'react';
import { Card, Loader, Message } from 'semantic-ui-react';

import MarketCard from '../../Market/views/MarketCard';
import { fetchServiceBySubService } from '../../Services/actions/service';
import { IService } from '../../Services/types/service';
import { IGroup } from '../types/group';

interface IGroupProps {
  group: IGroup;
}

interface IGroupStates {
  services: IService[];
  isFetching: boolean;
  error: Error;
}

class GroupServices extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    services: [],
    isFetching: true,
    error: Error()
  };

  public componentWillMount() {
    const { group } = this.props;
    group.Services.map(service => {
      fetchServiceBySubService(service._id)
        .then(s => {
          const services: IService[] = this.state.services;
          services.push(s);
          this.setState({ services, isFetching: false });
        })
        .catch(error => this.setState({ error, isFetching: false }));
    });
  }

  public render() {
    const { group } = this.props;
    const { services, error, isFetching } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>There was an issue</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    if (group.Services.length === 0) {
      return (
        <Message info={true}>
          <Message.Header>You don't have any services</Message.Header>
        </Message>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <Card.Group>
        {services.map((service: IService, index: number) => (
          <MarketCard service={service} groups={[group]} key={index} />
        ))}
      </Card.Group>
    );
  }
}

export default GroupServices;
