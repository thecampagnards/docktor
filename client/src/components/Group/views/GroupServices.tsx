import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Message, Grid, Icon } from 'semantic-ui-react';

import { IGroupService } from '../../Services/types/service';
import { getService } from '../actions/group';
import { IGroup } from '../types/group';
import GroupService from './GroupService';
import { path } from '../../../constants/path';

interface IGroupProps {
  group: IGroup;
  admin: boolean;
}

interface IGroupStates {
  isFetching: boolean;
  error: Error;
  modalOpen: boolean;
  content: string;
}

class GroupServices extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    services: [],
    isFetching: true,
    error: Error(),
    modalOpen: false,
    content: ""
  };

  public render() {
    const { group, admin } = this.props;
    const { error } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>Error while fetching services</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
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

        <Grid>
          {group.services.map((service: IGroupService, index: number) => (
            <Grid.Column width={8} key={index}>
              <GroupService service={service} admin={admin} />
            </Grid.Column>
          ))}
        </Grid>
        
      </>
      
    );
  }

  private handleOpen = (subserviceID: string) => {
    const { group } = this.props;
    getService(group._id, subserviceID)
      .then(content => this.setState({ content }))
      .catch(content => this.setState({ content }))
      .finally(() => this.setState({ modalOpen: true }));
  };

  private handleClose = () => this.setState({ modalOpen: false });
}

export default GroupServices;
