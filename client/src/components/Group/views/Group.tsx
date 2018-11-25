import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Loader, Table, Button } from 'semantic-ui-react';

import { IGroup, IContainer, IPort } from '../types/group';
import { fetchGroup, fetchContainers } from '../actions/group';

import Layout from '../../layout/layout';
import { fetchDaemon } from '../../Daemon/actions/daemon';
import { IDaemon } from '../../Daemon/types/daemon';
import { fetchServiceBySubService } from 'src/components/Services/actions/service';
import { IService } from 'src/components/Services/types/service';

interface IRouterProps {
  groupID: string;
}

interface IGroupStates {
  group: IGroup | null;
  containers: IContainer[];
  daemon: IDaemon | null;
  isFetching: boolean;
  error: Error | null;
}

class Group extends React.Component<RouteComponentProps<IRouterProps>, IGroupStates> {
  
  public state = {
    group: null,
    containers: [],
    daemon: null,
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { groupID } = this.props.match.params

    fetchContainers(groupID)
    .then((containers: IContainer[]) =>         this.setState({containers})    )

    fetchGroup(groupID)
      .then((group: IGroup) => {

        this.setState({group})

        fetchDaemon(group.DaemonID).then(
          (daemon: IDaemon) => this.setState({daemon, isFetching: false})
        )

        group.Services.map((gs, key) => {
          fetchServiceBySubService(gs._id).then(
            (service: IService) => {
              group.Services[key].SubService = service
              this.setState({group, isFetching: false})
            }
          )
        })

      })
      .catch((error: Error) => this.setState({error, isFetching: false}))
  }

  public render() {

    const { containers, daemon, group, error, isFetching } = this.state;

    if (!group) {
      return (
        <Layout>
          <h2>Group</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }
  
    if (error) {
      return (
        <Layout>
          <h2>Group</h2>
          <p>{error}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Group</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h2>Group</h2>
        <h3>Containers</h3>
          <Table celled={true} padded={true}>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell singleLine={true}>containerID</Table.HeaderCell>
        <Table.HeaderCell>Service</Table.HeaderCell>
        <Table.HeaderCell>Daemon</Table.HeaderCell>
        <Table.HeaderCell>Links</Table.HeaderCell>
        <Table.HeaderCell>Utils</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {containers.map((container: IContainer) => (


<Table.Row key={container.Id}>
<Table.Cell singleLine={true}>{container.Id}</Table.Cell>
<Table.Cell>
toto
</Table.Cell>
<Table.Cell>
{container.Ports.map((port: IPort) => (
  <p key={port.PublicPort}>
  {port.PublicPort}
  </p>
))}
</Table.Cell>
<Table.Cell>
<Button>Click Here</Button>
</Table.Cell>
</Table.Row>

      ))}


    </Table.Body>
  </Table>

        <p>{JSON.stringify(group)}</p>
        <p>{JSON.stringify(daemon)}</p>
      </Layout>
    );
  }
}

export default Group;
