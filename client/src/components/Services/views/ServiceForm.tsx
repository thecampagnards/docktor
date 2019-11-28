import * as _ from 'lodash';
import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { RouteComponentProps } from 'react-router';
import { Accordion, Button, Form, Grid, Icon, Loader, Message } from 'semantic-ui-react';

import { fetchComposeFileContent, fetchService, saveService } from '../actions/service';
import { IService, ISubService } from '../types/service';

interface IRouterProps {
  serviceID: string;
}

interface IServiceFormStates {
  service: IService;
  isFetching: boolean;
  isSuccess: boolean;
  openVersions: string[];
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
    openVersions: [] as string[],
    error: Error()
  };

  public componentDidMount() {
    const { serviceID } = this.props.match.params;
    if (serviceID) {
      fetchService(serviceID)
        .then((service: IService) => {
          // get the compose file of the services if url
          for (const key in service.sub_services) {
            if (service.sub_services.hasOwnProperty(key)) {
              const file = service.sub_services[key].file;
              if (this.isURL(file)) {
                fetchComposeFileContent(file).then(
                  content => (service.sub_services[key].compose = content)
                );
              }
            }
          }
          this.setState({ service });
        })
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
          <Form.Group>
            {service.image && (
              <img height={80} src={service.image} alt={service.name} />
            )}
            <Form.Input
              width={3}
              label="Service name"
              name="name"
              type="text"
              value={service.name}
              onChange={this.handleChange}
              required={true}
            />
            <Form.Input
              width={5}
              label="Tags (tag1,tag2,...)"
              name="tags"
              type="text"
              value={service.tags ? service.tags.join(",") : ""}
              onChange={this.handleChange}
            />
            <Form.Input
              width={4}
              label="Image"
              name="image"
              type="file"
              accept="image/*"
              onChange={this.handleChange}
            />
            <Form.Checkbox
              width={4}
              label="This service can only be deployed by Docktor administrators"
              name="admin"
              defaultChecked={service.admin}
              onChange={this.handleChange}
            />
          </Form.Group>

          <CodeMirror
            className="code-small"
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

          <Form.Input
            label="Link to documentation"
            name="link"
            type="url"
            value={service.link}
            onChange={this.handleChange}
          />

          <br />

          {service.sub_services &&
            service.sub_services.map((ss, key) => (
              <>
              <Accordion key={key} styled={true} fluid={true}>
                <Accordion.Title
                  active={openVersions.includes(ss._id)}
                  onClick={this.handleToggleVersion.bind(this, ss._id)}
                >
                  <Icon name="dropdown" />
                  {`${service.name} ${ss.name} (v${ss.version_index})`}
                </Accordion.Title>
                <Accordion.Content active={openVersions.includes(ss._id)}>
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={4}>
                        <Form.Input
                          label="Version name"
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
                      <Grid.Column width={3}>
                        <Form.Input
                          label="Version index"
                          fluid={true}
                          type="number"
                          name={`sub_services.${key}.version_index`}
                          value={ss.version_index}
                          onChange={this.handleChangeIndex}
                          required={true}
                        />
                      </Grid.Column>
                      <Grid.Column width={3}>
                        <Form.Input
                          label="Update index"
                          fluid={true}
                          type="number"
                          name={`sub_services.${key}.update_index`}
                          value={ss.update_index}
                          onChange={this.handleChangeIndex}
                          required={true}
                        />
                      </Grid.Column>
                      <Grid.Column width={4}>
                        <Button
                          basic={true}
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
                        <Form.Input
                          label="Service file URL"
                          fluid={true}
                          value={this.isURL(ss.file) ? ss.file : ""}
                          onChange={this.handleChange}
                          name={`sub_services.${key}.file`}
                        />
                        <CodeMirror
                          value={this.isURL(ss.file) ? ss.compose : ss.file}
                          options={{
                            mode: "yaml",
                            theme: "material",
                            lineNumbers: true,
                            readOnly: this.isURL(ss.file),
                            cursorBlinkRate: this.isURL(ss.file) ? -1 : 530,
                            gutters: [`sub_services.${key}.file`]
                          }}
                          autoCursor={false}
                          onChange={
                            this.isURL(ss.file)
                              ? void 0
                              : this.handleChangeCodeEditor
                          }
                        />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Accordion.Content>
              </Accordion>
              <br />
              </>
            ))}
          <Button
            basic={true}
            icon="plus"
            labelPosition="left"
            content="Add version"
            onClick={this.addSubService}
            color="green"
          />
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

  private handleToggleVersion = (versionID: string) => {
    let toggles = this.state.openVersions;
    if (toggles.includes(versionID)) {
      toggles = toggles.filter(v => v !== versionID)
    } else {
      toggles.push(versionID)
    }
    this.setState({ openVersions: toggles });
  };

  private removeSubService = (key: number) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    const service = this.state.service;
    service.sub_services.splice(key, 1);
    this.setState({ service });
  };

  private addSubService = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const service = this.state.service;
    const nextIndex = service.sub_services.length > 0 ? service.sub_services.sort((a,b) => b.version_index - a.version_index)[0].version_index + 1 : 1;
    const sub = {
      name: "",
      file: "",
      active: true,
      version_index: nextIndex,
      update_index: -1
    } as ISubService;
    service.sub_services
      ? service.sub_services.unshift(sub)
      : (service.sub_services = [sub]);
    this.setState({ service });
  };

  private isURL(str: string | undefined): boolean {
    try {
      const u = new URL(str!);
      return !!u.host;
    } catch (_) {
      return false;
    }
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>,
    { name, value, checked }: any
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
      this.setState({ service: _.set(service, name, value || checked) });
    }
  };

  private handleChangeIndex = (
    e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>,
    { name, value }: any
  ) => {
    this.setState({ service: _.update(this.state.service, name, function() {return Number(value)}) })
  }

  private handleChangeCodeEditor = (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState({
      service: _.set(this.state.service, editor.getOption("gutters")![0], value)
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
