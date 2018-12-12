import * as React from "react";
import { RouteComponentProps } from "react-router";
import * as _ from "lodash";
import {
  Loader,
  Form,
  Message,
  Button,
  Grid,
  Divider,
  Segment,
  Header,
  Icon
} from "semantic-ui-react";
import { UnControlled as CodeMirror, IInstance } from "react-codemirror2";

import Layout from "../../layout/layout";

import { IService } from "../types/service";
import { fetchService, saveService } from "../actions/service";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/yaml/yaml";
import "codemirror/mode/markdown/markdown";

interface IRouterProps {
  serviceID: string;
}

interface IServiceFormStates {
  service: IService;
  isFetching: boolean;
  isSuccess: boolean;
  error: Error | null;
}

class ServiceForm extends React.Component<
  RouteComponentProps<IRouterProps>,
  IServiceFormStates
> {
  public state = {
    service: {} as IService,
    isSuccess: false,
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { serviceID } = this.props.match.params;
    fetchService(serviceID)
      .then((service: IService) =>
        this.setState({ service, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { service, error, isSuccess, isFetching } = this.state;

    if (!service._id) {
      return (
        <Layout>
          <h2>Service</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Service</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h2>{service.Name}</h2>

        <Form success={isSuccess} error={error !== null} onSubmit={this.submit}>
          <Form.Input
            label="Name"
            name="Name"
            type="text"
            value={service.Name}
            onChange={this.handleChange}
          />
          <CodeMirror
            value={service.Description}
            options={{
              mode: "markdown",
              theme: "material",
              lineNumbers: true,
              gutters: ["Description"]
            }}
            onChange={this.handleChangeCodeEditor}
          />
          <Form.Group widths="equal">
            {service.Image && (
              <img src={"data:image/png;base64," + service.Image} />
            )}

            <Form.Input
              label="Image"
              name="Image"
              type="file"
              accept="image/*"
              onChange={this.handleChange}
            />
          </Form.Group>

          {service.SubServices.map((ss, key) => (
            <span key={ss._id}>
              <Form.Group widths="equal">
                <Form.Checkbox
                  width={1}
                  label="Active"
                  name={`SubServices.${key}.Active`}
                  defaultChecked={ss.Active}
                  onChange={this.handleChange}
                />
                <Form.Input
                  width={8}
                  label="Name"
                  name={`SubServices.${key}.Name`}
                  type="text"
                  value={ss.Name}
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Segment placeholder={true}>
                <Grid columns={2} stackable={true}>
                  <Divider vertical={true}>Or</Divider>
                  <Grid.Row verticalAlign="middle">
                    <Grid.Column>
                      <CodeMirror
                        value={ss.File}
                        options={{
                          mode: "yaml",
                          theme: "material",
                          lineNumbers: true,
                          gutters: [`SubServices.${key}.File`]
                        }}
                        onChange={this.handleChangeCodeEditor}
                      />
                    </Grid.Column>
                    <Grid.Column textAlign="center">
                      <Header icon={true}>
                        <Icon name="world" />
                        Remote file
                      </Header>
                      <Form.Input
                        type="Url"
                        name={`SubServices.${key}.Url`}
                        onChange={this.handleChange}
                      />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Segment>
            </span>
          ))}

          <Message
            success={true}
            header="Saved"
            content="Your group has been saved"
          />
          <Message error={true} header="Error" content={error} />
          <Button type="Save" loading={isFetching}>
            Save
          </Button>
        </Form>
      </Layout>
    );
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value }: any
  ) => {
    let service = this.state.service;

    if (e.target.files !== null) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          service = _.set(
            service,
            name,
            reader.result.replace("data:image/jpeg;base64,", "")
          );
          this.setState({ service });
        }
      };
      reader.onerror = error =>
        this.setState({ error: Error("When uploading file : " + error) });
    } else {
      service = _.set(service, name, value);
      this.setState({ service });
    }
  };

  private handleChangeCodeEditor = (
    editor: IInstance,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    const service = _.set(
      this.state.service,
      editor.options.gutters![0],
      value
    );
    this.setState({ service });
  };

  private submit = () => {
    this.setState({ isFetching: true });
    saveService(this.state.service)
      .then((service: IService) =>
        this.setState({ service, isSuccess: true, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };
}

export default ServiceForm;
