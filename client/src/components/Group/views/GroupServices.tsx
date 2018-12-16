import * as React from "react";
import { Loader, Card } from "semantic-ui-react";

import MarketCard from "../../Market/views/MarketCard";

import { IGroup } from "../types/group";
import { IDaemon } from "../../Daemon/types/daemon";
import { IService } from "src/components/Services/types/service";

import { fetchServiceBySubService } from "src/components/Services/actions/service";

interface IGroupProps {
  group: IGroup;
  daemon: IDaemon;
}

interface IGroupStates {
  services: IService[];
  isFetching: boolean;
  error: Error | null;
}

class GroupServices extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    services: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { group } = this.props;
    group.Services.map(service => {
      this.setState({ isFetching: true });
      fetchServiceBySubService(service._id)
        .then((s: IService) => {
          const services: IService[] = this.state.services;
          services.push(s);
          this.setState({ services, isFetching: false });
        })
        .catch((error: Error) => this.setState({ error, isFetching: false }));
    });
  }

  public render() {
    const { group } = this.props;
    const { services, error, isFetching } = this.state;

    if (!services) {
      return <p>No data yet ...</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <Card.Group>
        {services.map((service: IService, index: number) => (
          <MarketCard service={service} groups={[group]} key={index} />
        ))}
      </Card.Group>
    );
  }
}

export default GroupServices;
