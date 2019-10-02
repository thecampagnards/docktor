import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import {
    Button, ButtonProps, Card, Dropdown, Grid, Icon, Label, Modal, Popup
} from 'semantic-ui-react';

import { copy } from '../../../utils/clipboard';
import { fetchServiceBySubService } from '../../Services/actions/service';
import { IGroupService, IService } from '../../Services/types/service';
import { getServiceStatus, updateServiceStatus, saveGroupService, deleteGroupService } from '../actions/group';
import { IContainerStatus } from '../types/group';

interface IGroupServiceProps {
  groupID: string;
  service: IGroupService;
  admin: boolean;
}

interface IGroupServiceState {
  status: IContainerStatus[];
  modalOpen: boolean;
  error: Error;
  isFetching: boolean;
  subServiceError: Error;
  isFetchingSub: boolean;
  file: string;
  saveState: string;
}

export default class GroupService extends React.Component<
  IGroupServiceProps,
  IGroupServiceState
> {
  public state = {
    status: [] as IContainerStatus[],
    modalOpen: false,
    error: Error(),
    isFetching: false,
    subServiceError: Error(),
    isFetchingSub: true,
    file: window.atob(this.props.service.file),
    saveState: "saved"
  };

  private serviceVersion = "Version";
  private serviceDoc = "https://docs.cdk.corp.sopra/start/";

  public componentDidMount() {
    this.refreshStatus();

    const ssId = this.props.service.sub_service_id;
    fetchServiceBySubService(ssId)
      .then((s: IService) => {
        const sub = s.sub_services.find(ss => ss._id === ssId);
        this.serviceVersion = sub ? sub.name : ssId;
        this.serviceDoc = s.link;
      })
      .catch(error => this.setState({ subServiceError: error }))
      .finally(() => this.setState({ isFetchingSub: false }));
  }

  public render() {
    const { service, admin } = this.props;
    const { isFetching, status, modalOpen, file, saveState } = this.state;

    return (
      <Card fluid={true}>
        <Card.Content>
          <Grid>
            <Grid.Row>
              <Grid.Column width={4}>
                <h3>{service.name}</h3>
              </Grid.Column>
              <Grid.Column width={4}>
                <Label basic={true}>{this.serviceVersion}</Label>
              </Grid.Column>
              <Grid.Column width={8}>
                {status.map(cs => this.statusIndicator(cs))}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}>
                <Button.Group color="blue" floated="left">
                  <Button
                    labelPosition="left"
                    icon="external alternate"
                    content="Open"
                    as="a"
                    href={service.url}
                    disabled={
                      status.filter(cs => cs.State.startsWith("Exited"))
                        .length !== 0
                    }
                  />
                  <Button
                    icon="clipboard"
                    title="Copy URL"
                    onClick={copy.bind(this, service.url)}
                  />
                </Button.Group>
                {this.buttonStatus()}
              </Grid.Column>
              <Grid.Column width={8}>
                {admin && (
                  <Dropdown
                    className="button icon float-right margin-left"
                    basic={true}
                    icon="ellipsis vertical"
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={this.handleOpen}>
                        Edit service
                      </Dropdown.Item>
                      <Popup
                        trigger={<Dropdown.Item content="Remove service" />}
                        on="click"
                        content={
                          <Button.Group>
                            <Button
                              color="orange"
                              content="Keep data"
                              loading={isFetching}
                              onClick={this.remove.bind(this, false)}
                            />
                            <Button
                              color="red"
                              content="Remove data"
                              loading={isFetching}
                              onClick={this.remove.bind(this, true)}
                            />
                          </Button.Group>
                        }
                      />
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                <Button
                  basic={true}
                  icon="info"
                  labelPosition="left"
                  content="Documentation"
                  as="a"
                  href={this.serviceDoc}
                  target="_blank"
                  floated="right"
                />
                <Modal size="large" open={modalOpen} onClose={this.handleClose}>
                  <Modal.Header
                    icon="file alternate outline"
                    content={`${service.name} compose file`}
                  />
                  <Modal.Content>
                    <CodeMirror
                      value={file}
                      options={{
                        mode: "yaml",
                        theme: "material",
                        lineNumbers: true
                      }}
                      autoCursor={false}
                      onChange={this.handleEdit}
                    />
                  </Modal.Content>
                  <Modal.Actions>
                    <Button basic={true} labelPosition="left" icon="download" content="Save" 
                      onClick={this.save} loading={saveState === "saving"} disabled={saveState === "saved"}
                    />
                  </Modal.Actions>
                </Modal>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>
    );
  }

  private refreshStatus = () => {
    const { groupID, service } = this.props;
    this.setState({ isFetching: true });
    getServiceStatus(groupID, service.name)
      .then((status: IContainerStatus[]) => this.setState({ status }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };

  private updateServiceStatus = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    { name, removedata }: ButtonProps
  ) => {
    const { groupID, service } = this.props;
    this.setState({ isFetching: true });
    updateServiceStatus(groupID, service.name, name, !!removedata)
      .then(() => this.refreshStatus())
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };

  private statusIndicator = (cs: IContainerStatus) => {
    switch (true) {
      case cs.State.startsWith("Up"):
        return (
          <Icon
            key={cs.Name}
            className="float-right"
            color="green"
            circular={true}
            name="circle"
            title={`Container ${cs.Name} is running`}
          />
        );
      case cs.State.startsWith("Exited"):
        return (
          <Icon
            key={cs.Name}
            className="float-right"
            color="red"
            circular={true}
            name="circle"
            title={`Container ${cs.Name} is not running`}
          />
        );
      default:
        return (
          <Icon
            key={cs.Name}
            className="float-right"
            color="grey"
            circular={true}
            name="circle"
            title={`Container ${cs.Name} : ${cs.State}`}
          />
        );
    }
  };

  private buttonStatus = () => {
    const { status, isFetching } = this.state;

    const buttonStart = (
      <Button
        floated="right"
        basic={true}
        circular={true}
        color="green"
        icon="play"
        labelPosition="right"
        loading={isFetching}
        content="Start"
        name="start"
        onClick={this.updateServiceStatus}
      />
    );
    const buttonStop = (
      <Button
        floated="right"
        basic={true}
        circular={true}
        color="orange"
        icon="stop"
        labelPosition="right"
        loading={isFetching}
        content="Stop"
        name="stop"
        onClick={this.updateServiceStatus}
      />
    );
    const buttonDelete = (
      <Button
        floated="right"
        basic={true}
        circular={true}
        color="red"
        icon="delete"
        loading={isFetching}
        title="Remove containers"
        name="remove"
        onClick={this.updateServiceStatus}
      />
    );

    switch (true) {
      case status.length === 0:
        return (
          <Button
            floated="right"
            basic={true}
            circular={true}
            color="blue"
            icon="sliders"
            labelPosition="right"
            loading={isFetching}
            content="Create"
            name="start"
            onClick={this.updateServiceStatus}
          />
        );
      case status.length ===
        status.filter(s => s.State.startsWith("Up")).length:
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
  };

  private handleOpen = () => this.setState({ modalOpen: true });
  private handleClose = () => this.setState({ modalOpen: false });

  private handleEdit = (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState({
      file: value, saveState: ""
    });
  };

  private save = () => {
    const { groupID, service } = this.props;
    const { file } = this.state;
    this.setState({ saveState: "saving" })
    saveGroupService(groupID, service.name, file)
      .then(() => this.setState({ saveState: "saved" }))
      .catch(error => this.setState({ error, saveState: "" }));
  }

  private remove = (rm: boolean) => {
    const { groupID, service } = this.props;
    deleteGroupService(groupID, service.name, rm)
      .then(() => this.refreshStatus)
      .catch(error => this.setState({ error }));
  }
}
