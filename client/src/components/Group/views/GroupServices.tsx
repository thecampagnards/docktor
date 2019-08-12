import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Message, Grid, Icon } from 'semantic-ui-react';

import { IGroupService } from '../../Services/types/service';
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

        {admin ? 
          <Grid>
            <Grid.Column width={12}>
              {group.services.length === 0 && (
                <pre>No service in this group. Use the button on the right to deploy one.</pre>
              )}
            </Grid.Column>
            <Grid.Column width={4}>
              <Button primary={true} labelPosition="right" icon={true} as={Link} to={path.marketgroup.replace(":groupID", group._id)} floated="right">
                <Icon name="plus" />ADD SERVICE
              </Button>
            </Grid.Column>
          </Grid>
          : 
          <pre>No service in this group. Contact your group administrator to request one.</pre>
        }

        <Grid>
          {group.services.map((service: IGroupService, index: number) => (
            <Grid.Column width={8} key={index}>
              <GroupService groupID={group._id} service={service} admin={admin} />
            </Grid.Column>
          ))}
        </Grid>
        
      </>
      
    );
  }
}

export default GroupServices;
