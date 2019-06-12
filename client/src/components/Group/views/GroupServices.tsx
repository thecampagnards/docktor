import * as React from 'react';
import { Card, Loader, Message, Grid, Button, Icon } from 'semantic-ui-react';

import { fetchServiceBySubService } from '../../Services/actions/service';
import { IService } from '../../Services/types/service';
import { IGroup } from '../types/group';
import GroupService from './GroupService';
import { Link } from 'react-router-dom';
import { path } from 'src/constants/path';

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
    isFetching: false,
    error: Error()
  };

  public componentWillMount() {
    const { group } = this.props;
    group.services.map(service => {
      fetchServiceBySubService(service._id)
        .then(s => {
          const services: IService[] = this.state.services;
          services.push(s);
          this.setState({ services });
        })
        .catch(error => this.setState({ error }));
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

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <>

        <Grid>
          <Grid.Column width={12} />
          <Grid.Column width={4}>
            <Button primary={true} labelPosition="right" icon={true} as={Link} to={path.marketgroup.replace(":groupID", group._id)} floated="right">
              <Icon name="plus" />ADD SERVICE
            </Button>
          </Grid.Column>
        </Grid>

        <Card.Group>
          {services.map((service: IService, index: number) => (
            <GroupService service={service} />
          ))}
        </Card.Group>
        
      </>
    );
  }
}

export default GroupServices;
