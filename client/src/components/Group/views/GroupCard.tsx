import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
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
          <Card.Header>{group.name.toUpperCase()}</Card.Header>
          <Card.Description>
            {"Admins : "}
              {group.admins && (group.admins.length > 0 ? group.admins.join(", ") : "None")}
          </Card.Description>
        </Card.Content>
        {group.description && <Card.Content>
          <ReactMarkdown source={group.description} escapeHtml={false} />
        </Card.Content>}
        {(displayButtons || admin) &&
        <Card.Content extra={true}>
          <Button color="green" icon={true} labelPosition="left" as={Link} to={path.groupsServices.replace(":groupID", group._id)}>
            <Icon name="cubes" />
            Services
          </Button>
          <Button icon={true} as={Link} to={path.groupsMembers.replace(":groupID", group._id)}>
            <Icon name="users" />
          </Button>
          {groupAdmin &&
          <Button icon={true} as={Link} to={path.groupsEdit.replace(":groupID", group._id)}>
            <Icon name="edit" />
          </Button>
          }
          {admin &&
          <Button icon={true} floated="right" as={Link} to={path.daemonsSSH.replace(":daemonID", group.daemon_id!)}>
            <Icon name="terminal" />
          </Button>
          }
        </Card.Content>
        }
      </Card>
    )
  }
}
