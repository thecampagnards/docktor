import * as React from 'react';
import { Card, Label } from 'semantic-ui-react';

import { IService } from '../../Services/types/service';

interface IGroupServiceProps {
  service: IService
}

export default class GroupService extends React.Component<IGroupServiceProps> {
  public render() {
    const { service } = this.props;

    return (
      <Card fluid={true}>
        <Card.Content>
          <Card.Header floated="left">{service.name}</Card.Header>
          <Label>Version</Label>
          <Card.Description>
            Service stuffs
          </Card.Description>
        </Card.Content>
      </Card>
    )
  }
}