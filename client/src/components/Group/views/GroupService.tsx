import * as React from 'react';
import { Card, Label, Grid, Button, Icon, Dropdown, Menu } from 'semantic-ui-react';

import { IService } from '../../Services/types/service';

interface IGroupServiceProps {
  service: IService
}

export default class GroupService extends React.Component<IGroupServiceProps> {
  public render() {
    const { service } = this.props;
    const options = [
      { key: 1, text: "Edit service", value: 1 },
      { key: 2, text: "Delete service", value: 2 },
    ]

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
              <Grid.Column width={3}>
                <Button.Group color="green">
                  <Button>Open</Button>
                  <Button icon="clipboard" title="Copy URL" />
                </Button.Group>
              </Grid.Column>
              <Grid.Column width={9}>
                <Button icon="list alternate outline" title="See docker-compose file" />
                <Button icon="info" title="See documentation" />
              </Grid.Column>
              <Grid.Column width={4}>
                <Dropdown floated="right" className="button icon" floating={true} icon="ellipsis vertical" options={options} trigger={<React.Fragment />} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>
    )
  }
}