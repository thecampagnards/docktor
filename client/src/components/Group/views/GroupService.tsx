import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import {
    Button, ButtonProps, Card, Dropdown, Grid, Image, Label, Modal, Popup, List, Form, Input, InputOnChangeData, Message
} from 'semantic-ui-react';

import { copy } from '../../../utils/clipboard';
import { fetchServiceBySubService } from '../../Services/actions/service';
import { IGroupService, IService, ISubService, IServiceVariable } from '../../Services/types/service';
import { getServiceStatus, saveGroupService, updateServiceStatus, updateService } from '../actions/group';
import { IContainerStatus } from '../types/group';
import ServiceStatusIndicator from '../../layout/ServiceStatusIndicator';

interface IGroupServiceProps {
  groupID: string;
  service: IGroupService;
  admin: boolean;
}

interface IGroupServiceState {
  status: IContainerStatus[];
  modalOpen: boolean;
  updating: boolean;
  update: ISubService;
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
    updating: false,
    update: {} as ISubService,
    error: Error(),
    isFetching: false,
    subServiceError: Error(),
    isFetchingSub: true,
    file: window.atob(this.props.service.file || ""),
    saveState: "saved"
  };

  private serviceVersion = "Version";
  private serviceDoc = "https://docs.cdk.corp.sopra/start/";
  private serviceIcon: string;
  private serviceTitle = "";
  private updateIndex = 0;

  public componentDidMount() {
    this.refreshStatus();

    const ssId = this.props.service.sub_service_id;
    fetchServiceBySubService(ssId)
      .then((s: IService) => {
        const sub = s.sub_services.find(ss => ss._id === ssId);
        this.serviceVersion = sub ? sub.name : ssId;
        this.serviceDoc = s.link;
        this.serviceIcon = s.image;
        this.serviceTitle = s.name;
        if (sub && sub.update_index !== sub.version_index) {
          this.updateIndex = sub.update_index >= 0 ? sub.update_index : this.computeLatest(s, sub.version_index);
        }
      })
      .catch(error => this.setState({ subServiceError: error }))
      .finally(() => this.setState({ isFetchingSub: false }));
  }

  public render() {
    const { service, admin } = this.props;
    const { isFetching, status, modalOpen, updating, update, file, saveState } = this.state;

    return (
      <Card fluid={true}>
        <Card.Content>
          <Grid>
            <Grid.Row>
              <Grid.Column width={4}>
                {this.serviceIcon && (
                  <Image
                    src={this.serviceIcon}
                    title={this.serviceTitle}
                    avatar={true}
                  />
                )}
                <span style={{ fontWeight: "bold", fontSize: 16 }}>
                  {" " + service.name}
                </span>
              </Grid.Column>
              <Grid.Column width={4}>
                <Label basic={true}>{this.serviceVersion}</Label>
                {this.updateIndex !== 0 &&
                  <Button
                    basic={true}
                    compact={true}
                    icon="level up"
                    title="Update available"
                    onClick={this.openUpdate}
                  />
                }
              </Grid.Column>
              <Grid.Column width={8}>
                {status.map(cs => <ServiceStatusIndicator key={cs.Name} cs={cs} />)}
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
                    target="_blank"
                    disabled={
                      status.length === 0 ||
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
                {admin ? (
                  <Dropdown
                    className="button icon float-right margin-left"
                    basic={true}
                    icon="ellipsis vertical"
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={this.handleOpen}>
                        Edit service
                      </Dropdown.Item>
                      <Modal
                        trigger={<Dropdown.Item content="Remove service" />}
                        size="mini"
                      >
                        <Modal.Header>{`Delete service ${service.name} ?`}</Modal.Header>
                        <Modal.Actions>
                          <Button.Group fluid={true}>
                            <Button
                              color="orange"
                              icon="hdd"
                              content="Keep data"
                              loading={isFetching}
                              onClick={this.remove.bind(this, false)}
                            />
                            <Button
                              color="red"
                              icon="trash"
                              content="Remove data"
                              loading={isFetching}
                              onClick={this.remove.bind(this, true)}
                            />
                          </Button.Group>
                        </Modal.Actions>
                      </Modal>
                    </Dropdown.Menu>
                  </Dropdown>
                )
                :
                (
                  service.variables && (
                    <Popup
                      trigger={
                        <Button
                          basic={true}
                          circular={true}
                          icon="cog"
                          title="Display service config"
                          floated="right"
                          disabled={service.variables.length === 0}
                        />
                      }
                      on="click"
                      position="bottom right"
                      wide="very"
                      content={
                        <List divided={true} >
                          {service.variables.map(v => (
                            <List.Item key={v.name}>
                              <List.Header>
                                {v.name.replace(/secret_|optional_/g, "").replace(/_/g, " ").toUpperCase()}
                              </List.Header>
                              {v.value.length === 0 ? "<no value>" : v.value}
                            </List.Item>
                          ))}
                        </List>
                      }
                    />
                  )
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
                    <Button
                      basic={true}
                      labelPosition="left"
                      icon="download"
                      content="Save"
                      onClick={this.save}
                      loading={saveState === "saving"}
                      disabled={saveState === "saved"}
                    />
                  </Modal.Actions>
                </Modal>
                <Modal size="large" open={updating} onClose={this.closeUpdate}>
                  <Modal.Header
                    icon="level up"
                    content={`Update service ${this.serviceTitle}`}
                  />
                  <Modal.Content>
                    <Form id="update-form" loading={!update._id} onSubmit={this.migrate}>
                      <h3>Service name : {service.name}</h3>
                      {(update.variables && update.variables.length > 0) ?
                        <>
                          <h5>Variables</h5>
                          {update.variables.map((variable: IServiceVariable) => (
                            <Form.Field
                              inline={true}
                              key={variable.name}
                              required={!variable.optional}
                            >
                              <label>
                                {variable.name.replace(/optional_|secret_/g, "").replace(/_/g, " ").toUpperCase()}
                              </label>
                              <Input
                                name={variable.name}
                                required={!variable.optional}
                                onChange={this.handleChangeVariable}
                                value={variable.value}
                                type={variable.secret ? "password" : "text"}
                              />
                            </Form.Field>
                          ))}
                        </>
                        :
                        <Message compact={true} content="No additional configuration required" />
                      }
                    </Form>
                  </Modal.Content>
                  <Modal.Actions>
                    <Button
                      basic={true}
                      color="green"
                      labelPosition="left"
                      icon="hand point up"
                      content="Update"
                      form="update-form"
                      type="submit"
                      loading={saveState === "updating"}
                      disabled={!update._id}
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
    { name }: ButtonProps
  ) => {
    const { groupID, service } = this.props;
    this.setState({ isFetching: true });
    updateServiceStatus(groupID, service.name, name)
      .then(() => this.refreshStatus())
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
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
      file: value,
      saveState: ""
    });
  };

  private save = () => {
    const { groupID, service } = this.props;
    const { file } = this.state;
    this.setState({ saveState: "saving" });
    saveGroupService(groupID, service.name, file)
      .then(() => this.setState({ saveState: "saved" }))
      .catch(error => this.setState({ error, saveState: "" }));
  };

  private remove = (rm: boolean) => {
    const { groupID, service } = this.props;
    this.setState({ isFetching: true });
    updateServiceStatus(groupID, service.name, "destroy", rm)
      .then(() => window.location.reload())
      .catch(error => this.setState({ error, isFetching: false }));
  };

  private openUpdate = () => {
    const { update } = this.state;
    if (!update._id) {
      this.getUpdate();
    }
    this.setState({ updating: true });
  }

  private closeUpdate = () => {
    this.setState({ updating: false });
  }

  private getUpdate = () => {
    const { groupID, service } = this.props;
    updateService(groupID, service.name)
      .then((sub: ISubService) => this.setState({ update: sub }))
      .catch(error => this.setState({ error }));
  }

  private migrate = () => {
    const { update } = this.state;
    console.log(update);
  }

  private handleChangeVariable = (
    event: any,
    { name, value }: InputOnChangeData
  ) => {
    const { update } = this.state;
    for (const i in update.variables) {
      if (update.variables[i].name === name) {
        update.variables[i].value = value;
      }
    }
    this.setState({ update });
  };

  private computeLatest = (s: IService, current: number) => {
    if (s.sub_services.length < 2) {
      return 0;
    }
    const highest = s.sub_services.sort((a,b) => b.version_index - a.version_index)[0].version_index;
    return highest === current ? 0 : -1;
  }
}
