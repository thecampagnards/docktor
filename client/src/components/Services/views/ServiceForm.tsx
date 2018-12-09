import * as React from "react";
import { RouteComponentProps } from "react-router";
import {
  Loader,
  Form,
  Message,
  Button,
  Checkbox,
  Grid,
  Divider,
  Segment,
  Header,
  Icon
} from "semantic-ui-react";

import { IService } from "../types/service";
import { fetchService, saveService } from "../actions/service";

import Layout from "../../layout/layout";
import Highlight from "react-highlight";
import "highlight.js/styles/github.css";

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

    if (error) {
      return (
        <Layout>
          <h2>Service</h2>
          <p>{error}</p>;
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
          <Form.TextArea
            label="Description"
            name="Description"
            value={service.Description}
            onChange={this.handleChange}
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

          {service.SubServices.map(ss => (
            <span key={ss._id}>
              <Form.Group widths="equal">
                <Checkbox
                  label="Active"
                  name="Active"
                  toggle={true}
                  defaultChecked={ss.Active}
                  onChange={this.handleChange}
                />
                <Form.Input
                  label="Name"
                  name="Name"
                  type="text"
                  value={ss.Name}
                  onChange={this.handleChange}
                />
              </Form.Group>

              <Segment placeholder={true}>
                <Grid columns={2} stackable={true} textAlign="center">
                  <Divider vertical={true}>Or</Divider>

                  <Grid.Row verticalAlign="middle">
                    <Grid.Column>
                      <Header icon={true}>
                        <Icon name="world" />
                        Remote file
                      </Header>

                      <Form.Input name="url" onChange={this.handleChange} />
                    </Grid.Column>

                    <Grid.Column>
                      <Highlight className="yaml">{ss.File}</Highlight>

                      <Form.TextArea
                        label="File"
                        name="File"
                        value={ss.File}
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
            Submit
          </Button>
        </Form>
      </Layout>
    );
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value }: any
  ) => {
    const service = this.state.service;
    service[name] = value;
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
