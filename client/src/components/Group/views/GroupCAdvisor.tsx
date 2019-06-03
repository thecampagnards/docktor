import * as React from "react";
import { Loader, Message, Progress } from "semantic-ui-react";

import { fetchCadvisorMachine } from "../../Daemon/actions/daemon";
import { IContainerInfo, IMachineInfo } from "../../Daemon/types/daemon";
import { fetchCadvisorContainers } from "../actions/group";
import { IGroup } from "../types/group";

interface IGroupCAdvisorProps {
  group: IGroup;
  admin: boolean;
}

interface IGroupCAdvisorStates {
  containerInfo: IContainerInfo;
  machineInfo: IMachineInfo;
  isFetching: boolean;
  error: Error;
}

class GroupCAdvisor extends React.Component<
  IGroupCAdvisorProps,
  IGroupCAdvisorStates
> {
  public state = {
    containerInfo: {} as IContainerInfo,
    machineInfo: {} as IMachineInfo,
    isFetching: false,
    error: Error()
  };

  private refreshIntervalId: NodeJS.Timeout;

  public componentWillMount() {
    const { group } = this.props;

    fetchCadvisorMachine(group.daemon_id as string)
      .then((machineInfo: IMachineInfo) =>
        this.setState({ machineInfo, isFetching: false })
      )
      .catch((error: Error) => {
        this.setState({ error, isFetching: false });
      });

    const fetch = () => {
      fetchCadvisorContainers(group._id)
        .then((containerInfo: IContainerInfo) =>
          this.setState({ containerInfo, error: Error() })
        )
        .catch((error: Error) => {
          this.setState({ error });
        });
    };

    fetch();
    this.refreshIntervalId = setInterval(fetch, 1000 * 10);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshIntervalId);
  }

  public render() {
    const { containerInfo, machineInfo, error, isFetching } = this.state;

    if (error.message) {
      return (
        <>
          <Message negative={true}>
            <Message.Header>
              There was an issue with your CAdvisor
            </Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <>
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
          className="reverse"
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
          className="reverse"
        />
        {containerInfo.name &&
          containerInfo.stats[0].filesystem &&
          containerInfo.stats[0].filesystem
            .sort((a, b) => a.device.length - b.device.length)
            .map(fs => (
              <Progress
                key={fs.device}
                value={(fs.usage / 1000000000).toFixed(3)}
                total={(fs.capacity / 1000000000).toFixed(3)}
                progress="ratio"
                indicating={true}
                label={"Disk - " + fs.device}
                className="reverse"
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

export default GroupCAdvisor;
