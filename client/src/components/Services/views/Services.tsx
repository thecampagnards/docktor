import * as React from "react";
import { Link } from "react-router-dom";
import { Button, Loader, Table } from "semantic-ui-react";

import { IService } from "../types/service";
import { fetchServices } from '../actions/service';

import Layout from "../../layout/layout";
import { path } from "../../../constants/path";

interface IServicesStates {
  services: IService[];
  isFetching: boolean;
  error: Error | null;
}

class Services extends React.Component<{}, IServicesStates> {

  public state = {
    services: [],
    isFetching: false,
    error: null
  };

  public componentDidMount() {
    fetchServices()
    .then((services: IService[]) => this.setState({services, isFetching: false}))
    .catch((error: Error) => this.setState({ error, isFetching: false }))
  }

  public render() {
    const { services, error, isFetching } = this.state;

    if (!services) {
      return (
        <Layout>
          <h2>Services</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }
  
    if (error) {
      return (
        <Layout>
          <h2>Services</h2>
          <p>{error}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Services</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h2>Services</h2>
        <Table sortable={true} celled={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                Image
              </Table.HeaderCell>
              <Table.HeaderCell>
                Name
              </Table.HeaderCell>
              <Table.HeaderCell>Tools</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {services.map((service: IService) => (
              <Table.Row key={service._id}>
                <Table.Cell>{service.Image ? <img src={"data:image/png;base64," + service.Image}/> : "No image"}</Table.Cell>
                <Table.Cell>{service.Name}</Table.Cell>
                <Table.Cell>
                  <Button.Group>
                    <Button
                      icon="edit"
                      content="Edit"
                      as={Link}
                      to={path.servicesEdit + "/" + service._id}
                    />
                    <Button
                      icon="cog"
                      content="More"
                      as={Link}
                      to={path.servicesMore + "/" + service._id}
                    />
                  </Button.Group>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Layout>
    );
  }
}

export default Services;