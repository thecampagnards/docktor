import * as React from "react";

import CmdSocket from "../../layout/CmdSocket";

import { IDaemon } from "../types/daemon";

interface IDaemonContainersProps {
  daemon: IDaemon;
}


class Daemon extends React.Component<
  IDaemonContainersProps
> {

  public render() {
    const { daemon } = this.props;
    return <CmdSocket apiURL={`/api/daemons/${daemon._id}/ssh/term`} />;
  }
}

export default Daemon;
