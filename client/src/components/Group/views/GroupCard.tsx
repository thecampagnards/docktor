import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Icon } from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { IGroup } from '../../Group/types/group';

interface IGroupCardProps {
  group: IGroup,
  admin: boolean,
  groupAdmin: boolean,
  displayButtons: boolean
}

export default class GroupCard extends React.Component<IGroupCardProps> {
  public render() {
    const { group, admin, groupAdmin, displayButtons } = this.props

    return (
      <Card fluid={true}>
        <Card.Content>
          <Card.Header as={Link} to={path.groupsSummary.replace(":groupID", group._id)}>
            {group.name.toUpperCase()}
          </Card.Header>
          <Card.Description>
            {(group.admins && group.admins.length > 0) ?
              `Admins : ${group.admins.join(", ")}`
              :
              "This group has no admin."
            }
          </Card.Description>
        </Card.Content>
        {(displayButtons || admin) &&
        <Card.Content>
          <Button basic={true} color="blue" icon={true} labelPosition="left" title="Open group services" as={Link} to={path.groupsServices.replace(":groupID", group._id)}>
            <Icon name="cubes" />
            Services
          </Button>
          <Button basic={true} color="blue" icon={true} title="Containers" as={Link} to={path.groupsContainers.replace(":groupID", group._id)}>
            <Icon name="block layout" />
          </Button>
          <Button basic={true} icon={true} title="Group members" as={Link} to={path.groupsMembers.replace(":groupID", group._id)}>
            <Icon name="users" />
          </Button>
          {groupAdmin &&
          <Button basic={true} icon={true} title="Edit group" as={Link} to={path.groupsEdit.replace(":groupID", group._id)}>
            <Icon name="edit" />
          </Button>
          }
          {admin &&
          <Button basic={true} circular={true} icon={true} floated="right" title="Connect to the VM" as={Link} to={path.daemonsSSH.replace(":daemonID", group.daemon_id!)}>
            <Icon name="terminal" />
          </Button>
          }
        </Card.Content>
        }
      </Card>
    )
  }
}
