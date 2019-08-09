import * as _ from 'lodash';
import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { RouteComponentProps } from 'react-router';
import { Accordion, Button, Divider, Form, Grid, Icon, Loader, Message } from 'semantic-ui-react';

import { fetchService, saveService } from '../actions/service';
import { IService, ISubService } from '../types/service';

interface IRouterProps {
  serviceID: string;
}

interface IServiceFormStates {
  service: IService;
  isFetching: boolean;
  isSuccess: boolean;
  openVersions: boolean;
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
    openVersions: false,
    error: Error()
  };

  public componentDidMount() {
    const { serviceID } = this.props.match.params;
    if (serviceID) {
      fetchService(serviceID)
        .then(service => this.setState({ service }))
        .catch(error => this.setState({ error }))
        .finally(() => this.setState({ isFetching: false }));
    } else {
      this.setState({
        service: { sub_services: [] as ISubService[] } as IService,
        isFetching: false
      });
    }
  }

  public render() {
    const { service, error, isSuccess, isFetching, openVersions } = this.state;

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
            {service.image && <img src={service.image} alt={service.name} />}

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
            label="Tags (tag1,tag2,...)"
            name="tags"
            type="text"
            value={service.tags ? service.tags.join(",") : ""}
            onChange={this.handleChange}
          />

          <br />

          <Accordion styled={true} fluid={true}>
            <Accordion.Title
              active={openVersions}
              onClick={this.handleToggleVersions}
            >
              <Icon name="dropdown" />
              Versions
            </Accordion.Title>
            <Accordion.Content active={openVersions}>
              <Grid>
                {service.sub_services &&
                  service.sub_services.map((ss, key) => (
                    <>
                      <Grid.Row>
                        <Grid.Column width={10}>
                          <Form.Input
                            fluid={true}
                            value={ss.name}
                            onChange={this.handleChange}
                            name={`sub_services.${key}.name`}
                            required={true}
                          />
                        </Grid.Column>
                        <Grid.Column width={2}>
                          <Form.Checkbox
                            width={1}
                            label="Active"
                            name={`sub_services.${key}.active`}
                            defaultChecked={ss.active}
                            onChange={this.handleChange}
                          />
                        </Grid.Column>
                        <Grid.Column width={4}>
                          <Button
                            color="red"
                            icon="minus"
                            labelPosition="left"
                            content="Delete version"
                            fluid={true}
                            onClick={this.removeSubService(key)}
                          />
                        </Grid.Column>
                      </Grid.Row>
                      <Grid.Row>
                        <Grid.Column width={16}>
                          Write docker-compose or remote file URL :
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
                      </Grid.Row>
                      <Divider />
                    </>
                  ))}
                <Grid.Row>
                  <Grid.Column>
                    <Button
                      icon="plus"
                      labelPosition="left"
                      content="Add version"
                      onClick={this.addSubService}
                      color="green"
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Accordion.Content>
          </Accordion>
          <br />
          <Message
            success={true}
            header="Saved"
            content="Your service has been saved"
          />
          <Message error={true} header="Error" content={error.message} />
          <br />
          <Button
            icon={true}
            labelPosition="left"
            color="teal"
            type="submit"
            loading={isFetching}
          >
            <Icon name="save" />
            SAVE
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

  private handleToggleVersions = () => {
    const toggle = this.state.openVersions;
    this.setState({ openVersions: !toggle });
  };

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
    e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>,
    { name, value }: any
  ) => {
    const { service } = this.state;

    // @ts-ignore
    if (e.target.files && e.target.files !== null) {
      const reader = new FileReader();
      // @ts-ignore
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
