import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Grid, Icon, Message } from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { IGroupService, IService } from '../../Services/types/service';
import { IGroup } from '../types/group';
import GroupService from './GroupService';
import { IContainer } from '../../Daemon/types/daemon';
import { fetchContainers } from '../actions/group';

interface IGroupProps {
  group: IGroup;
  admin: boolean;
  groupAdmin: boolean;
}

interface IGroupStates {
  services: IService[];
  isLegacy: boolean;
  isFetching: boolean;
  error: Error;
  modalOpen: boolean;
  content: string;
}

class GroupServices extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    services: [] as IService[],
    isLegacy: false,
    isFetching: true,
    error: Error(),
    modalOpen: false,
    content: ""
  };

  public componentDidMount() {
    this.checkLegacy();
  }

  public render() {
    const { group, admin, groupAdmin } = this.props;
    const { isLegacy, error } = this.state;

    return (
      <>
        {error.message &&
          <Message negative={true}>
            <Message.Header>Error while checking containers</Message.Header>
            <p>{error.message}</p>
          </Message>
        }

        {isLegacy &&
          <Message floating={true} icon={true} >
            <Icon name="warning" />
            <Message.Content>
              <Message.Header>Import your services</Message.Header>
              You have containers that were deployed by a legacy mode, thus you cannot maintain them as services.
              To transform those containers into services, please create a support IT request.<br/>
              During the process, the services will be migrated on our secured solution (SSO) and this will have few impacts (URL changes).
              Check the CDK documentation for more details about SSO.
            </Message.Content>
          </Message>
        }

        {groupAdmin ? (
          <Grid>
            <Grid.Column width={12}>
              {group.services.length === 0 && (
                <Message
                  warning={true}
                  content="No service in this group. Use the button on the right to deploy one."
                  compact={true}
                />
              )}
            </Grid.Column>
            <Grid.Column width={4}>
              <Button
                primary={true}
                labelPosition="right"
                icon={true}
                as={Link}
                to={path.marketGroup.replace(":groupID", group._id)}
                floated="right"
              >
                <Icon name="plus" />
                ADD SERVICE
              </Button>
            </Grid.Column>
          </Grid>
        ) : (
          <>
            {group.services.length === 0 && (
              <Message
                warning={true}
                content="No service in this group. Contact your group administrator to request one."
                compact={true}
              />
            )}
            <br />
            <br />
          </>
        )}

        <Grid>
          {group.services
              .sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
              .map((service: IGroupService, index: number) => 
          (
            <Grid.Column width={8} key={index}>
              <GroupService
                groupID={group._id}
                service={service}
                admin={admin}
                groupAdmin={groupAdmin}
              />
            </Grid.Column>
          ))}
        </Grid>
      </>
    );
  }

  private checkLegacy = () => {
    fetchContainers(this.props.group._id)
      .then((containers: IContainer[]) => {
        containers && containers.forEach(c => {
          if (Object.entries(c.Labels).filter(l => l[0] === "SERVICE_NAME").length === 0) {
            this.setState({ isLegacy: true });
          }
        })
      })
      .catch((error: Error) => this.setState({ error }));
  };
}

export default GroupServices;
