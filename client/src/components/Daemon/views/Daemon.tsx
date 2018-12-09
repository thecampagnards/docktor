import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Loader, Progress, Button, Divider } from "semantic-ui-react";

import ContainerTable from "src/components/layout/ContainersTable";
import Layout from "../../layout/layout";

import { fetchDaemon, fetchContainers, fetchCadvisor } from "../actions/daemon";

import { IDaemon, ICadvisor } from "../types/daemon";
import { IContainer } from "../../Group/types/group";

interface IRouterProps {
  daemonID: string;
}

interface IDaemonStates {
  daemon: IDaemon;
  cadvisor: ICadvisor;
  containers: IContainer[];
  isFetching: boolean;
  error: Error | null;
}

class Daemon extends React.Component<
  RouteComponentProps<IRouterProps>,
  IDaemonStates
> {
  public state = {
    daemon: {} as IDaemon,
    cadvisor: {} as ICadvisor,
    containers: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { daemonID } = this.props.match.params;
    fetchDaemon(daemonID)
      .then((daemon: IDaemon) => this.setState({ daemon, isFetching: false }))
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    fetchCadvisor(daemonID)
      .then((cadvisor: ICadvisor) =>
        this.setState({ cadvisor, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    fetchContainers(daemonID)
      .then((containers: IContainer[]) => this.setState({ containers }))
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { cadvisor, containers, daemon, error, isFetching } = this.state;

    if (!daemon) {
      return (
        <Layout>
          <h2>Daemon</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }

    if (error) {
      return (
        <Layout>
          <h2>Daemon</h2>
          <p>{error}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Daemon</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h2>{daemon.Host}</h2>
        <p>{daemon.Description}</p>
        <Divider horizontal={true}>Cadvisor</Divider>
        <h4>
          Cadvisor container :
          <Button.Group>
            <Button color="orange" disabled={false}>
              Stop
            </Button>
            <Button.Or />
            <Button color="red" disabled={false}>
              Remove
            </Button>
            <Button.Or />
            <Button color="green" disabled={false}>
              Start
            </Button>
          </Button.Group>
        </h4>
        <Progress
          value={cadvisor.name && cadvisor.stats[0].memory.usage}
          total={cadvisor.name && cadvisor.spec.memory.limit}
          progress="ratio"
          indicating={true}
          label="RAM"
        />
        <Progress
          value={cadvisor.name && cadvisor.stats[0].cpu.cfs.periods}
          total={cadvisor.name && cadvisor.spec.cpu.limit}
          progress="ratio"
          indicating={true}
          label="CPU"
        />
        {cadvisor.name &&
          cadvisor.stats[0].filesystem.map(fs => (
            <Progress
              value={fs.usage}
              total={fs.capacity}
              progress="ratio"
              indicating={true}
              label={"Disk - " + fs.device}
            />
          ))}
        <Divider horizontal={true}>Docker</Divider>
        <ContainerTable daemon={daemon} containers={containers} />
      </Layout>
    );
  }
}

export default Daemon;
