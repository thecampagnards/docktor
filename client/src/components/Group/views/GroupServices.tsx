import * as React from "react";
import { Loader } from "semantic-ui-react";

import { IGroup } from "../types/group";

import { IDaemon } from "../../Daemon/types/daemon";
import { fetchServiceBySubService } from 'src/components/Services/actions/service';
import { IService } from 'src/components/Services/types/service';
import ServiceModal from 'src/components/Services/views/ServiceModal';

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

    // @TODO
    group.Services.map(service => {
      fetchServiceBySubService(service._id)
      .then((services: IService[]) => this.setState({ services }))
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
      return  <p>{error}</p>;
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <>
        {services.map((service:IService)=> <ServiceModal   service={service}  groups={[group]} key={service._id} />)}
      </>
    );
  }
}

export default GroupServices;
