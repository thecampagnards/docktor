import './Services.css';

import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Button, Grid, Image, Label, Loader, Message, Search, SearchProps, Table
} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { fetchServices } from '../actions/service';
import { IService, ISubService } from '../types/service';

interface IServicesStates {
  services: IService[];
  servicesFiltered: IService[];
  isFetching: boolean;
  error: Error;
}

class Services extends React.Component<{}, IServicesStates> {
  public state = {
    services: [] as IService[],
    servicesFiltered: [] as IService[],
    isFetching: true,
    error: Error()
  };

  public componentDidMount() {
    fetchServices()
      .then(services =>
        this.setState({
          services,
          servicesFiltered: services
        })
      )
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { servicesFiltered, error, isFetching } = this.state;

    if (error.message) {
      return (
        <>
          <h2>Services</h2>
          <Message negative={true}>
            <Message.Header>
              Failed to load services with error :
            </Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    if (isFetching) {
      return (
        <>
          <h2>Services</h2>
          <Loader active={true} />
        </>
      );
    }

    return (
      <>
        <Grid>
          <Grid.Column width={2}>
            <h2>Services</h2>
          </Grid.Column>
          <Grid.Column width={4}>
            <Search
              size="tiny"
              placeholder="Search services..."
              showNoResults={false}
              onSearchChange={this.filterServices}
            />
          </Grid.Column>
          <Grid.Column width={10}>
            <Button
              basic={true}
              color="blue"
              floated="right"
              as={Link}
              to={path.servicesNew}
              labelPosition="right"
              icon="plus"
              content="New service"
            />
            <Button
              basic={true}
              floated="right"
              as="a"
              href="https://innersource.soprasteria.com/dep/cdk/library/docktor-services"
              target="_blank"
              labelPosition="left"
              icon="code"
              content="Sources"
            />
          </Grid.Column>
        </Grid>
        <Table celled={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Logo</Table.HeaderCell>
              <Table.HeaderCell>Service</Table.HeaderCell>
              <Table.HeaderCell>Versions</Table.HeaderCell>
              <Table.HeaderCell>Options</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {servicesFiltered
                .slice(0, 20)
                .sort((a,b) => a.name.localeCompare(b.name))
                .map(service => (
              <Table.Row key={service._id}>
                <Table.Cell width={2}>
                  {service.image ? (
                    <Image className="service-icon" src={service.image} />
                  ) : (
                    "No image"
                  )}
                </Table.Cell>
                <Table.Cell width={2}>{service.name}</Table.Cell>
                <Table.Cell width={10}>
                  {service.sub_services &&
                    service.sub_services.map((version: ISubService, key) => {
                      return (
                        version.active && (
                          <Label key={`${service._id}-${key}`}>
                            {version.name}
                          </Label>
                        )
                      );
                    })}
                </Table.Cell>
                <Table.Cell width={2}>
                  <Button.Group fluid={true}>
                    <Button
                      icon="edit"
                      content="Configure"
                      as={Link}
                      to={path.servicesEdit.replace(":serviceID", service._id)}
                    />
                  </Button.Group>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </>
    );
  }

  private filterServices = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    this.setState({
      servicesFiltered: this.state.services.filter(service =>
        service.name.toLowerCase().includes((value as string).toLowerCase())
      )
    });
  };
}

export default Services;
