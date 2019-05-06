import './MarketCard.css';

import * as React from 'react';
import { Card, Image } from 'semantic-ui-react';

import { IGroup } from '../../Group/types/group';
import { IService } from '../../Services/types/service';
import MarketModal from './MarketModal';

interface IMarketCardProps {
  service: IService;
  groups: IGroup[];
  admin: boolean;
}

export default class MarketCard extends React.Component<IMarketCardProps> {
  public render() {
    const { service, groups, admin } = this.props

    return (
      <Card fluid={true}>
        {service.image && (
          <Image src={service.image} />
        )}
        <Card.Content>
          <Card.Header>{service.name}</Card.Header>
        </Card.Content>
        <Card.Content extra={true}>
          <MarketModal service={service} groups={groups} admin={admin} />
        </Card.Content>
      </Card>
    )
  }
}
