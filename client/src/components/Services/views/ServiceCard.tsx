import * as React from "react";
import { Card, Image } from "semantic-ui-react";

import MarketModal from "src/components/Services/views/ServiceModal";

import { IService } from "../types/service";
import { IGroup } from "src/components/Group/types/group";

interface ICardProps {
  service: IService;
  groups: IGroup[];
}

export default class ServiceCard extends React.Component<ICardProps, {}> {
  public render() {
    const { groups, service } = this.props;
    return (
      <Card>
        {service.Image && (
          <Image src={"data:image/png;base64," + service.Image} />
        )}
        <Card.Content>
          <Card.Header>{service.Name}</Card.Header>
          <Card.Meta>
            <span className="date">{service._id}</span>
          </Card.Meta>
          <Card.Description
            dangerouslySetInnerHTML={{ __html: service.Description }}
          />
        </Card.Content>
        <Card.Content extra={true}>
          <MarketModal service={service} groups={groups} />
        </Card.Content>
      </Card>
    );
  }
}
