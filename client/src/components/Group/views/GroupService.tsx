import * as React from 'react';
import { Card, Label, Grid, Button, Icon, Dropdown } from 'semantic-ui-react';

import { IService, IGroupService } from '../../Services/types/service';

interface IGroupServiceProps {
  service: IGroupService,
  admin: boolean
}

export default class GroupService extends React.Component<IGroupServiceProps> {
  public render() {
    const { service, admin } = this.props;
    const options = [
      { key: 1, text: "Edit service", value: 1 },
      { key: 2, text: "Delete service", value: 2 },
    ];

    return (
      <Card fluid={true}>
        <Card.Content>
          <Grid fluid={true}>
            <Grid.Row>
              <Grid.Column width={4}>
                <h3>{service.name}</h3>
              </Grid.Column>
              <Grid.Column width={4}>
                <Label compact={true} basic={true}>7.6 community</Label>
              </Grid.Column>
              <Grid.Column width={6} />
              <Grid.Column width={2}>
                <Icon className="float-right" color="green" circular={true} name="circle" title="Service is running" />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}>
                <Button.Group color="blue" floated="left">
                  <Button labelPosition="left" icon="external alternate" content="Open" />
                  <Button icon="clipboard" title="Copy URL" />
                </Button.Group>
                <Button color="red" basic={true} circular={true} labelPosition="right" icon="stop" content="Stop" title="Stop service" floated="right" />
              </Grid.Column>
              <Grid.Column width={8}>
                {admin && 
                  <Dropdown className="button icon float-right margin-left" basic={true} icon="ellipsis vertical" options={options} trigger={<React.Fragment />} />
                }
                <Button basic={true} icon="info" labelPosition="left" content="Documentation" as="a" href={service.url} target="_blank" floated="right" />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>
    )
  }
}