import * as React from 'react';
import { Card, Loader, Message } from 'semantic-ui-react';

import { fetchServiceBySubService } from '../../Services/actions/service';
import { IService } from '../../Services/types/service';
import { IGroup } from '../types/group';
import GroupService from './GroupService';

interface IGroupProps {
  group: IGroup;
  admin: boolean;
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
    group.services.map(service => {
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

    if (group.services.length === 0) {
      return (
        <Message info={true}>
          <Message.Header>There is no service in this group yet.</Message.Header>
          <Message.Content>Check the documentation...</Message.Content>
        </Message>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <Card.Group>
        {services.map((service: IService, index: number) => (
          <GroupService service={service} />
        ))}
      </Card.Group>
    );
  }
}

export default GroupServices;
