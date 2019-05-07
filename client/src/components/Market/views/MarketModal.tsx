import './MarketModal.css';

import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import {
    Button, DropdownProps, Form, Grid, Icon, Image, Input, InputOnChangeData, Message, Modal, Select
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { deployService } from '../../Group/actions/group';
import { IGroup, IServiceGroup } from '../../Group/types/group';
import { IService, ISubService } from '../../Services/types/service';

interface IMarketModalStates {
  selectedGroupID: string;
  selectedSubServiceID: string;
  variables: any;
  opts: object;

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
}

class MarketModal extends React.Component<
  IMarketModalProps,
  IMarketModalStates
  > {
  public state = {
    selectedGroupID: "",
    selectedSubServiceID: "",
    variables: {},
    opts: {},

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
        {service.link && (
          <Button
            icon={true}
            labelPosition="left"
            as="a"
            href={service.link}
            target="_blank"
          >
            <Icon name="info circle" />
            Info
          </Button>
        )}
        <Button
          color="green"
          icon={true}
          labelPosition="right"
          onClick={this.open}
        >
          <Icon name="play" />
          Deploy
        </Button>
        {admin && (
          <Button
            floated="right"
            icon={true}
            as={Link}
            to={path.servicesEdit.replace(":serviceID", service._id!)}
          >
            <Icon name="edit" />
          </Button>
        )}
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
    const { service, groups } = this.props;
    const { error, selectedGroupID, selectedSubServiceID } = this.state;

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
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          {service.sub_services && groups ?
            <>
              <Select
                placeholder="Select your group"
                options={groups.map(group => {
                  return { text: group.name, value: group._id };
                })}
                onChange={this.handleChangeGroup}
                defaultValue={selectedGroupID}
                search={true}
              />
              <Select
                placeholder="Select your sub service"
                options={service.sub_services.map(ss => {
                  return { text: ss.name, value: ss._id };
                })}
                onChange={this.handleChangeSubService}
                defaultValue={selectedSubServiceID}
                search={true}
              />
              <Button color="red" onClick={this.close}>
                <Icon name="remove" /> Exit
          </Button>
              <Button color="blue" onClick={this.continueFormStage2}>
                Proceed <Icon name="chevron right" />
              </Button>
            </>
            :
            <p>You cannot deploy this service (you may not be in any group).</p>
          }
        </Modal.Actions>
      </>
    );
  };

  private renderModalStage2 = () => {
    const { service } = this.props;
    const { variables, error, isFetching, selectedSubServiceID } = this.state;
    const ss = service.sub_services!.find(
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
          <Form>
            {ss.variables && (
              <>
                <h3>Variables</h3>
                {ss.variables.map((variable: string) => (
                  <Form.Field inline={true} key={variable}>
                    <label>{variable}</label>
                    <Input
                      name={variable}
                      onChange={this.handleChangeVariable}
                      value={variables[variable]}
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
              onChange={this.handleChangeOpts}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color="red" onClick={this.continueFormStage.bind(this, 1)}>
            <Icon name="chevron left" /> Previous
          </Button>
          <Button color="green" onClick={this.handleForm} loading={isFetching}>
            <Icon name="checkmark" /> Install
          </Button>
        </Modal.Actions>
      </>
    );
  };

  private renderModalStage3 = () => {
    const { selectedGroupID } = this.state
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
          <Button color="blue" as={Link} to={path.groupsServices.replace(":groupID", selectedGroupID)}>
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

  private handleChangeVariable = (
    event: any,
    { name, value }: InputOnChangeData
  ) => {
    const { variables } = this.state;
    variables[name] = value;
    this.setState({ variables });
  };

  private handleChangeOpts = (event: any, { name, checked, value }: any) => {
    const { opts } = this.state;
    opts[name!] = value || checked;
    this.setState({ opts });
  };

  private continueFormStage = (stage: number) => {
    this.setState({ stage });
  };

  private continueFormStage2 = () => {
    const { selectedGroupID, selectedSubServiceID } = this.state;
    const { groups } = this.props;
    if (selectedGroupID !== "" && selectedSubServiceID !== "") {
      const sg = (groups.find(
        g => g._id === selectedGroupID
      ) as IGroup).services.find(
        s => s._id === selectedSubServiceID
      ) as IServiceGroup;
      this.setState({
        stage: 2,
        variables: sg ? sg.variables : {},
        error: Error()
      });
    } else {
      this.setState({ error: Error("Please select a group and a version") });
    }
  };

  private handleForm = () => {
    const { service } = this.props;
    const {
      selectedGroupID,
      selectedSubServiceID,
      variables,
      opts
    } = this.state;
    const v = (service.sub_services!.find(
      s => s._id === selectedSubServiceID
    ) as ISubService).variables;

    if (v) {
      for (const key of v) {
        if (!variables.hasOwnProperty(key)) {
          this.setState({ error: Error("Please set every variables") });
          return;
        }
      }
    }

    if (selectedGroupID !== "" && selectedSubServiceID !== "") {
      this.setState({ isFetching: true });
      deployService(selectedGroupID, selectedSubServiceID, variables, opts)
        .then((serviceGroup: IServiceGroup) => {
          this.setState({ serviceGroup, isFetching: false, error: Error() });
          this.continueFormStage(3);
        })
        .catch((error: Error) => this.setState({ error, isFetching: false }));
    }
  };
}

export default MarketModal;
