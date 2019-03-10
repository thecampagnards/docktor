import * as React from "react";
import { Button, Grid, Loader, Search } from "semantic-ui-react";

import Layout from "../../layout/layout";
import MarketCard from './MarketCard';

import { IService } from "../../Services/types/service";
import { fetchServices } from "../../Services/actions/service";

import { IGroup } from "../../Group/types/group";
import { fetchGroups } from "../../Group/actions/group";
import { SyntheticEvent } from 'react';

interface IServicesStates {
  services: IService[];
  servicesFiltered: IService[];
  groups: IGroup[];
  isFetching: boolean;
  error: Error | null;
}

class Market extends React.Component<{}, IServicesStates> {
  public state = {
    services: [] as IService[],
    servicesFiltered: [] as IService[],
    groups: [] as IGroup[],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    fetchServices()
      .then((services: IService[]) =>
        this.setState({ services, servicesFiltered: services, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    fetchGroups()
      .then((groups: IGroup[]) => this.setState({ groups }))
      .catch((error: Error) => this.setState({ error }));
  }

  public render() {
    const { services, servicesFiltered, groups, error, isFetching } = this.state;

    if (!services) {
      return (
        <Layout>
          <h2>Market</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }

    if (error) {
      return (
        <Layout>
          <h2>Market</h2>
          <p>{(error as Error).message}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Market</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <Grid>
          <Grid.Column width={2}>
            <h2>Market</h2>
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
            <Button toggle={true} active={false}>Design</Button>
            <Button toggle={true} active={false}>Build</Button>
            <Button toggle={true} active={false}>Acceptance</Button>
            <Button toggle={true} active={false}>Performance</Button>
            <Button toggle={true} active={false}>Ops</Button>
            <Button toggle={true} active={false}>Monitoring</Button>
          </Grid.Column>
        </Grid>
        <Grid columns="equal">
          {servicesFiltered.map((service: IService) => (
            <Grid.Column key={service._id}>
              <MarketCard groups={groups} service={service} />
            </Grid.Column>
          ))}
        </Grid>
      </Layout>
    );
  }

  private filterServices = (event: SyntheticEvent, { value }: any) => {
    this.setState({servicesFiltered : this.state.services.filter(service => service.Name.includes(value))})
  }
}

export default Market;
