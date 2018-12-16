import * as React from "react";
import { Loader, Progress, Button, Message } from "semantic-ui-react";

import {
  fetchCadvisorMachine,
  fetchCadvisorContainers
} from "../actions/daemon";

import { IDaemon, IContainerInfo, IMachineInfo } from "../types/daemon";

interface IDaemonCAdvisorProps {
  daemon: IDaemon;
}

interface IDaemonCAdvisorStates {
  containerInfo: IContainerInfo;
  machineInfo: IMachineInfo;
  isFetching: boolean;
  error: Error | null;
}

class DaemonCAdvisor extends React.Component<
  IDaemonCAdvisorProps,
  IDaemonCAdvisorStates
> {
  public state = {
    daemon: {} as IDaemon,
    containerInfo: {} as IContainerInfo,
    machineInfo: {} as IMachineInfo,
    isFetching: false,
    error: null
  };

  public componentWillMount() {
    const { daemon } = this.props;

    fetchCadvisorMachine(daemon._id)
      .then((machineInfo: IMachineInfo) =>
        this.setState({ machineInfo, isFetching: false })
      )
      .catch((error: Error) => {
        this.setState({ error, isFetching: false });
      });

    const fetch = () => {
      fetchCadvisorContainers(daemon._id)
        .then((containerInfo: IContainerInfo) =>
          this.setState({ containerInfo })
        )
        .catch((error: Error) => {
          this.setState({ error });
        });
    };

    fetch();
    setTimeout(fetch, 1000 * 5);
  }

  public render() {
    const { containerInfo, machineInfo, error, isFetching } = this.state;

    const buttons = (
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
    );

    if (error) {
      return (
        <>
          <Message negative={true}>
            <Message.Header>
              There was an issue with your CAdvisor
            </Message.Header>
            <p>{(error as Error).message}</p>
          </Message>
          {buttons}
        </>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <>
        {buttons}
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
          containerInfo.stats[0].filesystem
            .sort((a, b) =>
              a.device > b.device ? 1 : b.device > a.device ? -1 : 0
            )
            .map(fs => (
              <Progress
                key={fs.device}
                value={fs.usage}
                total={fs.capacity}
                progress="ratio"
                indicating={true}
                label={"Disk - " + fs.device}
              />
            ))}
      </>
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

export default DaemonCAdvisor;
