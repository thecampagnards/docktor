import './MarketCard.css';

import * as React from 'react';
import { Card, Image } from 'semantic-ui-react';

import { IGroup } from '../../Group/types/group';
import { IService } from '../../Services/types/service';
import MarketModal from './MarketModal';

interface IMarketCardProps {
  service: IService
  groups: IGroup[]
}

export default class MarketCard extends React.Component<IMarketCardProps> {
  public render() {
    const { service, groups } = this.props

    return (
      <Card fluid={true}>
        {service.Image && (
          <Image src={service.Image} />
        )}
        <Card.Content>
          <Card.Header>{service.Name}</Card.Header>
        </Card.Content>
        <Card.Content extra={true}>
          <MarketModal service={service} groups={groups} />
        </Card.Content>
      </Card>
    )
  }
}
