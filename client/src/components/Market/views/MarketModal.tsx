import * as React from "react";
import { Link } from "react-router-dom";
import * as ReactMarkdown from "react-markdown";
import {
  Button,
  Header,
  Image,
  Modal,
  Icon,
  Select,
  Message,
  DropdownProps,
  Form,
  Input,
  InputOnChangeData
} from "semantic-ui-react";

import { IService, ISubServices } from "../../Services/types/service";
import { IGroup, IServiceGroup } from "../../Group/types/group";
import { deployService } from "../../Group/actions/group";

interface IMarketModalStates {
  selectedGroupID: string;
  selectedSubServiceID: string;
  variables: any;

  serviceGroup: IServiceGroup | null;
  isFetching: boolean;

  stage: number;
  error: Error | null;
  open: boolean;
}

interface IMarketModalProps {
  service: IService;
  groups: IGroup[];
}

class MarketModal extends React.Component<
  IMarketModalProps,
  IMarketModalStates
  > {
  public state = {
    selectedGroupID: "",
    selectedSubServiceID: "",
    variables: {},

    serviceGroup: null,
    isFetching: false,

    stage: 1,
    error: null,
    open: false
  };

  public render() {
    const { open, stage } = this.state;

    return (
      <>
        <Button onClick={this.open}>Modal</Button>
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
        <Modal.Header>Select your version</Modal.Header>
        <Modal.Content image={true}>
          {service.Image && <Image src={"data:image/png;base64," + service.Image} />}
          {error !== null && (
            <Message negative={true}>
              <Message.Header>{error}</Message.Header>
            </Message>
          )}
          <Modal.Description>
            <Header>{service.Name}</Header>
            <ReactMarkdown source={service.Description} />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Select
            placeholder="Select your group"
            options={groups.map(group => {
              return { text: group.Name, value: group._id };
            })}
            onChange={this.handleChangeGroup}
            defaultValue={selectedGroupID}
            search={true}
          />
          <Select
            placeholder="Select your sub service"
            options={service.SubServices.map(ss => {
              return { text: ss.Name, value: ss._id };
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
        </Modal.Actions>
      </>
    );
  };

  private renderModalStage2 = () => {
    const { service } = this.props
    const { error, isFetching, selectedSubServiceID } = this.state;

    return (
      <>
        <Modal.Header>Configuration</Modal.Header>
        <Modal.Content>
          {error !== null && (
            <Message negative={true}>
              <Message.Header>{error}</Message.Header>
            </Message>
          )}
          <Form>
          <h3>Variables</h3>
            {(service.SubServices.find(s => s._id === selectedSubServiceID) as ISubServices).Variables.map((variable: string) => (
              <Form.Field inline={true}>
                <label>{variable}</label>
                <Input name={variable} onChange={this.handleChangeVariable} />
              </Form.Field>
            ))}
            <h3>Other</h3>
            <Form.Checkbox inline={true} label="Fix ports" />
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
          <Button color="blue" as={Link} to="TODO">
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

  private handleChangeVariable = (event: any, { name, value }: InputOnChangeData) => {
    const { variables } = this.state
    variables[name] = value
    this.setState({ variables });
  };

  private continueFormStage = (stage: number) => {
    this.setState({ stage });
  };

  private continueFormStage2 = () => {
    const { selectedGroupID, selectedSubServiceID } = this.state;
    if (selectedGroupID !== "" && selectedSubServiceID !== "") {
      this.setState({ stage: 2 });
    } else {
      this.setState({ error: Error("Please select a group and a version") });
    }
  };

  private handleForm = () => {
    const { selectedGroupID, selectedSubServiceID, variables } = this.state;
    if (selectedGroupID !== "" && selectedSubServiceID !== "") {
      this.setState({ isFetching: true });
      deployService(selectedGroupID, selectedSubServiceID, variables)
        .then((serviceGroup: IServiceGroup) => {
          this.setState({ serviceGroup, isFetching: false });
          this.continueFormStage(3);
        })
        .catch((error: Error) => this.setState({ error, isFetching: false }));
    }
  };
}

export default MarketModal;
