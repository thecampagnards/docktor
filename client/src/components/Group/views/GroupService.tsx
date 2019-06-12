import * as React from 'react';
import { Card } from 'semantic-ui-react';

import { IService } from 'src/components/Services/types/service';

interface IGroupServiceProps {
  service: IService
}

export default class GroupService extends React.Component<IGroupServiceProps> {
  public render() {
    const { service } = this.props

    return (
      <Card fluid={true}>
        <Card.Content>
          <Card.Header>{service.name}</Card.Header>
          <Card.Meta>"Version</Card.Meta>
          <Card.Description>
            Service stuffs
          </Card.Description>
        </Card.Content>
      </Card>
    )
  }
}