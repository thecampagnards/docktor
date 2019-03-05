import * as React from "react";
import { Loader } from "semantic-ui-react";
import { Grid } from "semantic-ui-react";

import Layout from "../../layout/layout";
import MarketCard from './MarketCard';

import { IService } from "../../Services/types/service";
import { fetchServices } from "../../Services/actions/service";

import { IGroup } from "../../Group/types/group";
import { fetchGroups } from "../../Group/actions/group";

interface IServicesStates {
  services: IService[];
  groups: IGroup[];
  isFetching: boolean;
  error: Error | null;
}

class Market extends React.Component<{}, IServicesStates> {
  public state = {
    services: [],
    groups: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    fetchServices()
      .then((services: IService[]) =>
        this.setState({ services, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    fetchGroups()
      .then((groups: IGroup[]) => this.setState({ groups }))
      .catch((error: Error) => this.setState({ error }));
  }

  public render() {
    const { services, groups, error, isFetching } = this.state;

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
        <h2>Market</h2>
        <Grid columns="equal">
          {services.map((service: IService) => (
            <Grid.Column key={service._id}>
              <MarketCard groups={groups} service={service} />
            </Grid.Column>
          ))}
        </Grid>
      </Layout>
    );
  }
}

export default Market;
