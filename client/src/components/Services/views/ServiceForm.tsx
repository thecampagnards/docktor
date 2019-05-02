import * as _ from "lodash";
import * as React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { RouteComponentProps } from "react-router";
import {
  Button,
  Divider,
  Form,
  Grid,
  Header,
  Icon,
  Loader,
  Message,
  Segment
} from "semantic-ui-react";

import { fetchService, saveService } from "../actions/service";
import { IService, ISubService } from "../types/service";

interface IRouterProps {
  serviceID: string;
}

interface IServiceFormStates {
  service: IService;
  isFetching: boolean;
  isSuccess: boolean;
  error: Error;
}

class ServiceForm extends React.Component<
  RouteComponentProps<IRouterProps>,
  IServiceFormStates
> {
  public state = {
    service: {} as IService,
    isSuccess: false,
    isFetching: true,
    error: Error()
  };

  public componentWillMount() {
    const { serviceID } = this.props.match.params;
    if (serviceID) {
      fetchService(serviceID)
        .then(service => this.setState({ service, isFetching: false }))
        .catch(error => this.setState({ error, isFetching: false }));
    } else {
      this.setState({
        service: { sub_services: [] as ISubService[] } as IService,
        isFetching: false
      });
    }
  }

  public render() {
    const { service, error, isSuccess, isFetching } = this.state;

    if (isFetching) {
      return (
        <>
          <h2>Service</h2>
          <Loader active={true} />
        </>
      );
    }

    return (
      <>
        <h2>{service.name || "Create new service"}</h2>

        <Form
          success={isSuccess}
          error={!!error.message}
          onSubmit={this.submit}
        >
          <Form.Input
            label="Service name"
            name="name"
            type="text"
            value={service.name}
            onChange={this.handleChange}
            required={true}
          />

          <CodeMirror
            value={service.description}
            options={{
              mode: "markdown",
              theme: "material",
              lineNumbers: true,
              gutters: ["description"]
            }}
            autoCursor={false}
            onChange={this.handleChangeCodeEditor}
          />

          <br />

          <Form.Group widths="equal">
            {service.image && <img src={service.image} />}

            <Form.Input
              label="Image"
              name="image"
              type="file"
              accept="image/*"
              onChange={this.handleChange}
            />
          </Form.Group>

          <Form.Input
            label="Link to documentation"
            name="link"
            type="url"
            value={service.link}
            onChange={this.handleChange}
          />

          <Form.Input
            label="Tags"
            name="tags"
            type="text"
            value={service.tags ? service.tags.join(",") : ""}
            onChange={this.handleChange}
          />

          <br />
          <Button
            type=""
            icon={true}
            onClick={this.addSubService}
            color="green"
          >
            <Icon name="plus" />
            Add sub service
          </Button>

          {service.sub_services &&
            service.sub_services.map((ss, key) => (
              <span key={key}>
                <Button
                  icon={true}
                  onClick={this.removeSubService(key)}
                  color="red"
                >
                  <Icon name="minus" />
                  Remove sub service
                </Button>
                <Form.Group widths="equal">
                  <Form.Checkbox
                    width={1}
                    label="Active"
                    name={`sub_services.${key}.active`}
                    defaultChecked={ss.active}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    width={8}
                    label="Name"
                    name={`sub_services.${key}.name`}
                    type="text"
                    value={ss.name}
                    onChange={this.handleChange}
                    required={true}
                  />
                </Form.Group>
                <Segment placeholder={true}>
                  <Grid columns={2} stackable={true}>
                    <Divider vertical={true}>Or</Divider>
                    <Grid.Row verticalAlign="middle">
                      <Grid.Column>
                        <CodeMirror
                          value={this.isURL(ss.file) ? "" : ss.file}
                          options={{
                            mode: "yaml",
                            theme: "material",
                            lineNumbers: true,
                            gutters: [`sub_services.${key}.File`]
                          }}
                          autoCursor={false}
                          onChange={this.handleChangeCodeEditor}
                        />
                      </Grid.Column>
                      <Grid.Column textAlign="center">
                        <Header icon={true}>
                          <Icon name="world" />
                          Remote file
                        </Header>
                        <Form.Input
                          value={this.isURL(ss.file) ? ss.file : ""}
                          type="url"
                          name={`sub_services.${key}.file`}
                          onChange={this.handleChange}
                        />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Segment>
              </span>
            ))}
          <br />
          <Message
            success={true}
            header="Saved"
            content="Your service has been saved"
          />
          <Message error={true} header="Error" content={error.message} />
          <br />
          <Button type="submit" loading={isFetching}>
            Save
          </Button>
        </Form>
      </>
    );
  }

  private isURL(str: string | undefined): boolean {
    try {
      const u = new URL(str!);
      return !!u.host;
    } catch (_) {
      return false;
    }
  }

  private removeSubService = (key: number) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    const service = this.state.service;
    service.sub_services!.splice(key, 1);
    this.setState({ service });
  };

  private addSubService = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const service = this.state.service;
    const sub = {
      name: "",
      file: "",
      active: true
    } as ISubService;
    service.sub_services
      ? service.sub_services.unshift(sub)
      : (service.sub_services = [sub]);
    this.setState({ service });
  };

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value }: any
  ) => {
    const { service } = this.state;

    if (e.target.files !== null) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          this.setState({
            service: _.set(service, name, reader.result)
          });
        }
      };
      reader.onerror = error =>
        this.setState({ error: Error("When uploading file : " + error) });
    } else {
      if (name === "tags") {
        value = value.split(",");
      }
      this.setState({ service: _.set(service, name, value) });
    }
  };

  private handleChangeCodeEditor = (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState({
      service: _.set(this.state.service, editor.getOption("gutters")[0], value)
    });
  };

  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.setState({ isFetching: true });
    saveService(this.state.service)
      .then(service =>
        this.setState({
          service,
          isSuccess: true,
          isFetching: false,
          error: Error()
        })
      )
      .catch(error => this.setState({ error, isFetching: false }));
  };
}

export default ServiceForm;
