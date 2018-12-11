import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Loader, Progress, Button, Divider } from "semantic-ui-react";

import ContainerTable from "src/components/layout/ContainersTable";
import Layout from "../../layout/layout";

import {
  fetchDaemon,
  fetchContainers,
  fetchCadvisorMachine,
  fetchCadvisorContainers
} from "../actions/daemon";

import { IDaemon, IContainerInfo, IMachineInfo } from "../types/daemon";
import { IContainer } from "../../Group/types/group";

interface IRouterProps {
  daemonID: string;
}

interface IDaemonStates {
  daemon: IDaemon;
  containerInfo: IContainerInfo;
  machineInfo: IMachineInfo;
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
    containerInfo: {} as IContainerInfo,
    machineInfo: {} as IMachineInfo,
    containers: [],
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { daemonID } = this.props.match.params;
    fetchDaemon(daemonID)
      .then((daemon: IDaemon) => this.setState({ daemon, isFetching: false }))
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    fetchCadvisorMachine(daemonID)
      .then((machineInfo: IMachineInfo) =>
        this.setState({ machineInfo, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    setInterval(
      () => {
        fetchCadvisorContainers(daemonID)
          .then((containerInfo: IContainerInfo) =>
            this.setState({ containerInfo, isFetching: false })
          )
          .catch((error: Error) => this.setState({ error, isFetching: false }))
          fetchContainers(daemonID)
          .then((containers: IContainer[]) => this.setState({ containers }))
          .catch((error: Error) => this.setState({ error, isFetching: false }));
      }
          ,
      1000 * 5
    );


  }

  public render() {
    const {
      containerInfo,
      machineInfo,
      containers,
      daemon,
      error,
      isFetching
    } = this.state;

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
          value={
            (containerInfo.name &&
              machineInfo.machine_id &&
              this.CPUUsage(machineInfo, containerInfo)) ||
            0
          }
          total={100}
          progress="percent"
          indicating={true}
          label="CPU"
        />
        <Progress
          value={
            (containerInfo.name &&
              machineInfo.machine_id &&
              this.MemoryUsage(machineInfo, containerInfo)) ||
            0
          }
          total={100}
          progress="percent"
          indicating={true}
          label="RAM"
        />
        {containerInfo.name &&
          containerInfo.stats[0].filesystem.sort((a,b) => (a.device > b.device) ? 1 : ((b.device > a.device) ? -1 : 0)).map(fs => (
            <Progress
              key={fs.device}
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

  // https://github.com/google/cadvisor/blob/master/pages/assets/js/containers.js
  private CPUUsage = (
    machineInfo: IMachineInfo,
    containerInfo: IContainerInfo
  ): number => {
    if (containerInfo.spec.has_cpu && containerInfo.stats.length >= 2) {
      const cur = containerInfo.stats[containerInfo.stats.length - 1];
      const prev = containerInfo.stats[containerInfo.stats.length - 2];
      const rawUsage = cur.cpu.usage.total - prev.cpu.usage.total;
      const intervalNs = this.getInterval(cur.timestamp, prev.timestamp);

      // Convert to millicores and take the percentage
      const cpuUsage = Math.round(
        (rawUsage / intervalNs / machineInfo.num_cores) * 100
      );
      return cpuUsage > 100 ? 100 : cpuUsage;
    }
    return 0;
  };

  private MemoryUsage = (
    machineInfo: IMachineInfo,
    containerInfo: IContainerInfo
  ): number => {
    if (containerInfo.spec.has_memory) {
      const cur = containerInfo.stats[containerInfo.stats.length - 1];

      // Saturate to the machine size.
      let limit = containerInfo.spec.memory.limit;
      if (limit > machineInfo.memory_capacity) {
        limit = machineInfo.memory_capacity;
      }

      return Math.round((cur.memory.usage / limit) * 100);
    }
    return 0;
  };

  private getInterval(
    current: string | number | Date,
    previous: string | number | Date
  ): number {
    const cur = new Date(current);
    const prev = new Date(previous);
    // ms -> ns.
    return (cur.getTime() - prev.getTime()) * 1000000;
  }
}

export default Daemon;
