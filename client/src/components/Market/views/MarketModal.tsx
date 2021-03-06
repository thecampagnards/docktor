import './MarketModal.css';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Button, DropdownProps, Form, Grid, Icon, Image, Input, InputOnChangeData, Message, Modal, Select
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { IStoreState } from '../../../types/store';
import { deployService } from '../../Group/actions/group';
import { IGroup, IServiceGroup } from '../../Group/types/group';
import {
    IGroupService, IService, IServiceVariable, ISubService
} from '../../Services/types/service';

interface IMarketModalStates {
  selectedGroupID: string;
  selectedSubServiceID: string;
  serviceName: string;
  variables: IServiceVariable[];
  opts: Map<string, any>;
  force: boolean;

  serviceGroup: IServiceGroup;
  isFetching: boolean;

  stage: number;
  error: Error;
  open: boolean;
}

interface IMarketModalProps {
  service: IService;
  groups: IGroup[];
  admin: boolean;

  max_services: number;
}

class MarketModal extends React.Component<
  IMarketModalProps,
  IMarketModalStates
> {
  public state = {
    selectedGroupID:
      this.props.groups && this.props.groups.length === 1
        ? this.props.groups[0]._id
        : "",
    selectedSubServiceID:
      this.props.service.sub_services.length === 1
        ? this.props.service.sub_services[0]._id
        : "",
    serviceName: this.props.service.name.replace(/ /g, "_"),
    variables: [] as IServiceVariable[],
    opts: new Map<string, any>([["auto-update", true]]),
    force: false,

    serviceGroup: {} as IServiceGroup,
    isFetching: false,

    stage: 1,
    error: Error(),
    open: false
  };

  public render() {
    const { open, stage } = this.state;
    const { service, admin } = this.props;

    return (
      <>
        <Grid>
          <Grid.Column width={4}>
            <Button
              disabled={!service.link}
              basic={true}
              icon="info circle"
              title="Open documentation"
              as="a"
              href={service.link}
              target="_blank"
              floated="left"
            />
          </Grid.Column>
          <Grid.Column width={8}>
            <Button
              fluid={true}
              basic={true}
              circular={true}
              color="black"
              content={service.name}
              title="Deploy the service in a group"
              floated="left"
              onClick={this.open}
            />
          </Grid.Column>
          <Grid.Column width={4}>
            {admin && (
              <Button
                basic={true}
                circular={true}
                floated="right"
                icon="edit"
                as={Link}
                to={path.servicesEdit.replace(":serviceID", service._id)}
              />
            )}
          </Grid.Column>
        </Grid>
        <Modal
          closeIcon={true}
          open={open}
          closeOnEscape={true}
          closeOnDimmerClick={true}
          onClose={this.close}
        >
          {(() => {
            switch (stage) {
              case 1:
                return this.renderModalStage1();
              case 2:
                return this.renderModalStage2();
              case 3:
                return this.renderModalStage3();
              default:
                return null;
            }
          })()}
        </Modal>
      </>
    );
  }

  private renderModalStage1 = () => {
    const { admin, service, groups, max_services } = this.props;
    const { error, selectedGroupID, selectedSubServiceID } = this.state;
    const group =
      groups.find(g => g._id === selectedGroupID) ||
      ({ services: [] as IGroupService[] } as IGroup);

    return (
      <>
        <Modal.Header>Deploy your {service.name}</Modal.Header>
        <Modal.Content>
          <Grid>
            <Grid.Column width={4}>
              {service.image && <Image size="small" src={service.image} />}
              {error.message && (
                <Message negative={true}>
                  <Message.Header>{error.message}</Message.Header>
                </Message>
              )}
            </Grid.Column>
            <Grid.Column width={service.link ? 10 : 12}>
              <Modal.Description>
                <ReactMarkdown
                  source={service.description}
                  escapeHtml={false}
                />
              </Modal.Description>
            </Grid.Column>
            {service.link && (
              <Grid.Column width={2}>
                <Button
                  basic={true}
                  icon={true}
                  floated="right"
                  as="a"
                  href={service.link}
                  target="_blank"
                >
                  <Icon name="info circle" />
                </Button>
              </Grid.Column>
            )}
            {max_services < group.services.length + 1 && (
                <Message warning={true}>
                  <Message.Header>
                    You have reach the maximum amount of services in this group ({max_services})
                  </Message.Header>
                </Message>
              )}
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          {service.sub_services && groups.length !== 0 ? (
            <>
              <Select
                placeholder="Select group"
                options={groups.map(g => {
                  return { text: g.name, value: g._id };
                })}
                onChange={this.handleChangeGroup}
                defaultValue={selectedGroupID}
                search={true}
              />
              <Select
                placeholder="Select service version"
                options={service.sub_services.filter(ss => ss.active).map(ss => {
                  return { text: ss.name, value: ss._id };
                })}
                onChange={this.handleChangeSubService}
                defaultValue={selectedSubServiceID}
                search={true}
              />
              <Button
                color="blue"
                onClick={this.continueFormStage2}
                disabled={!admin && max_services < group.services.length + 1}
              >
                Deploy <Icon name="chevron right" />
              </Button>
            </>
          ) : (
            <p>
              You cannot deploy this service (you may not be admin of any
              group).
            </p>
          )}
        </Modal.Actions>
      </>
    );
  };

  private renderModalStage2 = () => {
    const { service } = this.props;
    const { error, isFetching, selectedSubServiceID, serviceName } = this.state;
    const ss = service.sub_services.find(
      s => s._id === selectedSubServiceID
    ) as ISubService;

    return (
      <>
        <Modal.Header>Configuration</Modal.Header>
        <Modal.Content>
          {error.message && (
            <Message negative={true}>
              <Message.Header>{error.message}</Message.Header>
            </Message>
          )}
          <Form id="modal-form" onSubmit={this.handleForm}>
            <Form.Field>
              <label>Service name</label>
              <Form.Input
                name="name"
                required={true}
                onChange={this.handleChangeName}
                value={serviceName}
              />
            </Form.Field>
            {ss.variables && ss.variables.length > 0 && (
              <>
                <h3>Variables</h3>
                {ss.variables.map((variable: IServiceVariable) => (
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
            )}
            <h3>Other</h3>
            <Form.Checkbox
              inline={true}
              label="Auto update"
              name="auto-update"
              defaultChecked={true}
              onChange={this.handleChangeOpts}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color="red" onClick={this.continueFormStage.bind(this, 1)}>
            <Icon name="chevron left" /> Previous
          </Button>
          <Button
            form="modal-form"
            color="green"
            type="submit"
            loading={isFetching}
          >
            <Icon name="checkmark" /> Install
          </Button>
        </Modal.Actions>
      </>
    );
  };

  private renderModalStage3 = () => {
    const { selectedGroupID } = this.state;
    return (
      <>
        <Modal.Header>Deployed</Modal.Header>
        <Modal.Content>
          <Message positive={true}>
            <Message.Header>
              Your service has been succesfuly deployed
            </Message.Header>
          </Message>
        </Modal.Content>
        <Modal.Actions>
          <Button color="blue" onClick={this.close}>
            <Icon name="chevron left" /> Close
          </Button>
          <Button
            color="blue"
            as={Link}
            to={path.groupsServices.replace(":groupID", selectedGroupID)}
          >
            <Icon name="checkmark" /> Go to your service
          </Button>
        </Modal.Actions>
      </>
    );
  };

  private close = () => this.setState({ open: false });
  private open = () => this.setState({ open: true });

  private handleChangeGroup = (event: any, data: DropdownProps) => {
    this.setState({ selectedGroupID: String(data.value) });
  };

  private handleChangeSubService = (event: any, data: DropdownProps) => {
    this.setState({ selectedSubServiceID: String(data.value) });
  };

  private handleChangeName = (
    event: any,
    { value }: InputOnChangeData
  ) => {
    this.setState({ serviceName: value, force: false });
  };

  private handleChangeVariable = (
    event: any,
    { name, value }: InputOnChangeData
  ) => {
    const { variables } = this.state;
    for (const i in variables) {
      if (variables[i].name === name) {
        variables[i].value = value;
      }
    }
    this.setState({ variables });
  };

  private handleChangeOpts = (event: any, { name, checked, value }: any) => {
    const { opts } = this.state;
    opts.set(name, value || checked);
    this.setState({ opts });
  };

  private continueFormStage = (stage: number) => {
    this.setState({ stage });
  };

  private continueFormStage2 = () => {
    const { selectedGroupID, selectedSubServiceID } = this.state;
    const { service } = this.props;
    if (selectedGroupID !== "" && selectedSubServiceID !== "") {
      const variables = (
        service.sub_services.find(ss => ss._id === selectedSubServiceID) ||
        ({} as ISubService)
      ).variables;
      this.setState({
        stage: 2,
        variables,
        error: Error()
      });
    } else {
      this.setState({ error: Error("Please select a group and a version") });
    }
  };

  private handleForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {
      selectedGroupID,
      selectedSubServiceID,
      serviceName,
      variables,
      opts,
      force
    } = this.state;

    const format = /^[a-zA-Z0-9_-]+$/;
    if (!format.test(serviceName)) {
      this.setState({
        error: Error("No special characters allowed in the service name")
      });
      return;
    }
    this.setState({ error: Error() });

    if (selectedGroupID !== "" && selectedSubServiceID !== "") {
      this.setState({ isFetching: true });
      deployService(
        selectedGroupID,
        selectedSubServiceID,
        serviceName,
        variables,
        opts,
        force
      )
        .then((serviceGroup: IServiceGroup) => {
          this.setState({ serviceGroup, isFetching: false, error: Error() });
          this.continueFormStage(3);
        })
        .catch((error: Error) => {
          if (error.message.includes("volume")) {
            this.setState({ error, force: true });
          } else {
            this.setState({ error });
          }
        })
        .finally(() => this.setState({ isFetching: false }));
    }
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { config } = state;
  return {
    max_services: config.config.max_services || 0
  };
};

export default connect(mapStateToProps)(MarketModal);
