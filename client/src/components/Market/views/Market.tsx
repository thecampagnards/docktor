import * as React from "react";
import { Loader } from "semantic-ui-react";
import { Card, Grid, Image } from "semantic-ui-react";

import { IService } from "../../Services/types/service";
import { fetchServices } from "../../Services/actions/service";

import Layout from "../../layout/layout";
import MarketModal from "./MarketModal";
import { fetchGroups } from "../../Group/actions/group";
import { IGroup } from "../../Group/types/group";

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

  public componentDidMount() {
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
          <p>{error}</p>;
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
              <Card>
                {service.Image && <Image src={"data:image/png;base64," + service.Image} />}
                <Card.Content>
                  <Card.Header>{service.Name}</Card.Header>
                  <Card.Meta>
                    <span className="date">{service._id}</span>
                  </Card.Meta>
                  <Card.Description
                    dangerouslySetInnerHTML={{ __html: service.Description }}
                  />
                </Card.Content>
                <Card.Content extra={true}>
                  <MarketModal service={service} groups={groups} />
                </Card.Content>
              </Card>
            </Grid.Column>
          ))}
        </Grid>
      </Layout>
    );
  }
}

export default Market;
