import * as React from 'react';
import { Card, Label, Grid, Button, Icon, Dropdown } from 'semantic-ui-react';

import { IGroupService } from '../../Services/types/service';
import { copy } from '../../../utils/clipboard';
import { getServiceStatus } from '../actions/group';

interface IGroupServiceProps {
  groupID: string;
  service: IGroupService,
  admin: boolean
}

interface IGroupServiceState {
  status: boolean;
  modalOpen: boolean;
  content: string;
  error: Error;
  isFetching: boolean;
}

export default class GroupService extends React.Component<IGroupServiceProps, IGroupServiceState> {
  public state = {
    status: false,
    modalOpen: false,
    content: "",
    error: Error(),
    isFetching: true
  }

  public componentDidMount() {
    this.refreshStatus();
  }

  public render() {
    const { service, admin } = this.props;
    const { status, modalOpen, content, error, isFetching } = this.state;
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
                <Label compact={true} basic={true}>{service.sub_service_id}</Label>
              </Grid.Column>
              <Grid.Column width={6} />
              <Grid.Column width={2}>
                <Icon className="float-right" color={this.statusColor(status)} circular={true} name="circle" title="Service is running" />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}>
                <Button.Group color="blue" floated="left">
                  <Button labelPosition="left" icon="external alternate" content="Open" as="a" href={service.url} />
                  <Button icon="clipboard" title="Copy URL" onClick={copy.bind(this, service.url)} />
                </Button.Group>
                <Button color={this.statusColor(status)} basic={true} circular={true} labelPosition="right" icon={this.statusIcon(status)} content="Stop" title="Stop service" floated="right" />
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

  private refreshStatus = () => {
    const { groupID, service } = this.props;
    this.setState({ isFetching: true });
    getServiceStatus(groupID, service.sub_service_id)
      .then(info => this.setState({ status: true }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  private statusColor = (status: boolean) => {
    return (status ? "green" : "red");
  }

  private statusIcon = (status: boolean) => {
    return (status ? "stop" : "play");
  }

  private handleOpen = () => {
    const { service } = this.props;
    this.setState({ modalOpen: true, content: service.file });
  };

  private handleClose = () => this.setState({ modalOpen: false });
}