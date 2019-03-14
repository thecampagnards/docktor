import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Button, Card, Icon } from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { IGroup } from '../../Group/types/group';

interface IGroupCardProps {
  group: IGroup;
}

export default class GroupCard extends React.Component<IGroupCardProps> {
  public render() {
    const { group } = this.props;

    return (
      <Card fluid={true}>
        <Card.Content header={group.Name} />
        <Card.Content description={true}>
          <ReactMarkdown source={group.Description} />
        </Card.Content>
        <Card.Content extra={true}>
          <Button icon={true} labelPosition="left" content="Services" as={Link} to={path.groupsServices.replace(":groupID", group._id)}>
            <Icon name="cubes" />
            Services
          </Button>
          <Button icon={true} labelPosition="right" content="Edit" as={Link} to={path.groupsEdit.replace(":groupID", group._id)}>
            <Icon name="edit" />
            Edit
          </Button>
          <Button icon={true} floated="right" content="SSH" as={Link} to={path.daemonsSSH.replace(":daemonID", group.DaemonID)}>
            <Icon name="terminal" />
          </Button>
        </Card.Content>
      </Card>
    );
  }
}
