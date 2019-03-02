
import * as React from "react";
import { Card, Image } from "semantic-ui-react";

import MarketModal from "./MarketModal";

import { IService } from "src/components/Services/types/service";
import { IGroup } from "src/components/Group/types/group";

interface IMarketCardProps {
  service: IService;
  groups: IGroup[];
}

export default class MarketCard extends React.Component<IMarketCardProps> {
  public render() {
    const { service, groups } = this.props;

    return (
      <Card centered={true}>
        {service.Image && (
          <Image src={"data:image/png;base64," + service.Image} />
        )}
        <Card.Content>
          <Card.Header>{service.Name}</Card.Header>
        </Card.Content>
        <Card.Content extra={true}>
          <MarketModal service={service} groups={groups} />
        </Card.Content>
      </Card>
    );
  }
}
