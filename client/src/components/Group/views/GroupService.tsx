import * as React from 'react';
import { Card, Label, Grid, Button, Icon, Dropdown, ButtonProps } from 'semantic-ui-react';

import { IGroupService } from '../../Services/types/service';
import { copy } from '../../../utils/clipboard';
import { getServiceStatus, updateServiceStatus } from '../actions/group';
import { IContainerStatus } from '../types/group';

interface IGroupServiceProps {
  groupID: string;
  service: IGroupService,
  admin: boolean
}

interface IGroupServiceState {
  status: IContainerStatus[];
  modalOpen: boolean;
  content: string;
  error: Error;
  isFetching: boolean;
}

export default class GroupService extends React.Component<IGroupServiceProps, IGroupServiceState> {
  public state = {
    status: [] as IContainerStatus[],
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
    const { status } = this.state;
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
                {status.map(cs => this.statusIndicator(cs))}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}>
                <Button.Group color="blue" floated="left">
                  <Button labelPosition="left" icon="external alternate" content="Open" as="a" href={service.url} />
                  <Button icon="clipboard" title="Copy URL" onClick={copy.bind(this, service.url)} />
                </Button.Group>
                {this.buttonStatus()}
              </Grid.Column>
              <Grid.Column width={8}>
                {admin && 
                  <Dropdown className="button icon float-right margin-left" basic={true} icon="ellipsis vertical" options={options} trigger={<React.Fragment />} />
                }
                <Button basic={true} icon="info" labelPosition="left" content="Documentation" as="a" href={service.url} target="_blank" floated="right" disabled={true} />
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
      .then((status: IContainerStatus[]) => this.setState({ status }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  private updateServiceStatus = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>, 
    { name }: ButtonProps
  ) => {
    const { groupID, service } = this.props;
    this.setState({ isFetching: true });
    updateServiceStatus(groupID, service.sub_service_id, name)
      .then(response => console.log("Service " + service.name + " : Status updated to " + name))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  private statusIndicator = (cs: IContainerStatus) => {
    switch (true) {
      case cs.State.startsWith("Up"):
        return <Icon className="float-right" color="green" circular={true} name="circle" title={`Container ${cs.Name} is running`} />;
      case cs.State.startsWith("Exited"):
        return <Icon className="float-right" color="red" circular={true} name="circle" title={`Container ${cs.Name} is not running`} />;
      default:
        return <Icon className="float-right" color="grey" circular={true} name="circle" title={`Container ${cs.Name} : ${cs.State}`} />;
    }
  }

  private buttonStatus = () => {
    const { status } = this.state;

    const buttonStart = <Button floated="right" basic={true} circular={true} color="green" icon="play" labelPosition="right" content="Start" name="start" onClick={this.updateServiceStatus} />;
    const buttonStop = <Button floated="right" basic={true} circular={true} color="orange" icon="stop" labelPosition="right" content="Stop" name="stop" onClick={this.updateServiceStatus} />;
    const buttonDelete = <Button floated="right" basic={true} circular={true} color="red" icon="delete" title="Remove containers" name="remove" onClick={this.updateServiceStatus} />;

    switch (true) {
      case status.length === 0:
        return <Button
          floated="right"
          basic={true}
          circular={true}
          color="blue"
          icon="sliders"
          labelPosition="right"
          content="Create" 
          name="start"
          onClick={this.updateServiceStatus} 
        />;
      case status.length === status.filter(s => s.State.startsWith("Up")).length:
        return (
          <>
            {buttonDelete}
            {buttonStop}
          </>
        );
      default:
        return (
          <>
            {buttonDelete}
            {buttonStart}
          </>
        );
    }
  }

  private handleOpen = () => {
    const { service } = this.props;
    this.setState({ modalOpen: true, content: service.file });
  };

  private handleClose = () => this.setState({ modalOpen: false });

}