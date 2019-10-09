import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Grid, Popup, Search, SearchProps, Segment, Message } from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { changeContainersStatus } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import { fetchGroupsByDaemon, transformServices } from '../../Group/actions/group';
import { IGroup } from '../../Group/types/group';
import { fetchImages } from '../../Images/actions/image';
import { IImage } from '../../Images/types/image';
import ContainerCard from './ContainerCard';

interface IContainersGridProps {
  daemon: IDaemon;
  admin: boolean;
  containers: IContainer[];
  refresh: () => void;
  groupId?: string;
}

interface IContainersGridState {
  images: IImage[];
  groups?: IGroup[];

  searchFilter: string;
  isFetching: string;
  error: Error;
}

export default class ContainersGrid extends React.Component<
  IContainersGridProps,
  IContainersGridState
> {
  public state = {
    images: [] as IImage[],
    groups: [] as IGroup[],

    searchFilter: "",
    isFetching: "",
    error: Error()
  };

  public componentDidMount() {
    const { daemon, groupId } = this.props;

    fetchImages().then(images => this.setState({ images }));
    if (!groupId) {
      fetchGroupsByDaemon(daemon._id).then(groups => this.setState({ groups }));
    }
  }

  public render() {
    const { daemon, containers, admin, refresh, groupId } = this.props;
    const { isFetching, error, images, searchFilter, groups } = this.state;

    // filter containers
    const containersFiltered =
      containers &&
      containers
        .filter(
          c =>
            (c.Name ? [c.Name] : c.Names).filter(n =>
              n.toLowerCase().includes(searchFilter.toLowerCase())
            ).length > 0
        )
        .sort((a, b) =>
          a.Created > b.Created ? 1 : b.Created > a.Created ? -1 : 0
        );

    return (
      <>
        {containers && containers.length > 0 ? (
          <>
            {groups.length > 0 && (
              <>
                GROUPS :{" "}
                {groups.map(g => (
                  <Button
                    size="mini"
                    primary={true}
                    key={g._id}
                    as={Link}
                    to={path.groupsContainers.replace(":groupID", g._id)}
                  >
                    {g.name}
                  </Button>
                ))}
              </>
            )}
            <Segment>
              <Grid>
                <Grid.Column width={6}>
                  <Search
                    size="tiny"
                    placeholder="Search containers..."
                    showNoResults={false}
                    onSearchChange={this.filterSearch}
                    value={searchFilter}
                  />
                </Grid.Column>
                <Grid.Column width={6}>
                  <Popup
                    flowing={true}
                    on="click"
                    inverted={true}
                    content={error.message || "Done!"}
                    trigger={
                      <Button
                        color="blue"
                        circular={true}
                        labelPosition="left"
                        icon="double angle right"
                        content="Run all"
                        loading={isFetching === "create"}
                        disabled={isFetching !== ""}
                        onClick={this.handleAllOnClick.bind(this, "create")}
                      />
                    }
                  />
                  <Popup
                    flowing={true}
                    on="click"
                    inverted={true}
                    content={error.message || "Done!"}
                    trigger={
                      <Button
                        color="green"
                        circular={true}
                        labelPosition="left"
                        icon="play"
                        content="Start all"
                        loading={isFetching === "start"}
                        disabled={isFetching !== ""}
                        onClick={this.handleAllOnClick.bind(this, "start")}
                      />
                    }
                  />
                  <Popup
                    flowing={true}
                    on="click"
                    inverted={true}
                    content={error.message || "Done!"}
                    trigger={
                      <Button
                        color="orange"
                        circular={true}
                        labelPosition="left"
                        icon="stop"
                        content="Stop all"
                        loading={isFetching === "stop"}
                        disabled={isFetching !== ""}
                        onClick={this.handleAllOnClick.bind(this, "stop")}
                      />
                    }
                  />
                </Grid.Column>
                <Grid.Column width={4}>
                  {groupId && admin && (
                    <>
                      <Button
                        basic={true}
                        circular={true}
                        icon="recycle"
                        onClick={this.handleTransform}
                        floated="right"
                        disabled={true}
                        title="WIP"
                      />
                      <Button
                        color="black"
                        circular={true}
                        icon="terminal"
                        labelPosition="right"
                        content="VM Terminal"
                        as={Link}
                        to={path.daemonsSSH.replace(":daemonID", daemon._id!)}
                        floated="right"
                      />
                    </>
                  )}
                </Grid.Column>
              </Grid>
            </Segment>
            <Grid className="three column grid">
              {containersFiltered.map((c: IContainer) => (
                <Grid.Column key={c.Id}>
                  <ContainerCard
                    container={c}
                    images={images.filter(i =>
                      RegExp(i.image.Pattern).test(c.Image)
                    )}
                    admin={admin}
                    daemon={daemon}
                    refresh={refresh}
                    groupId={
                      groupId ||
                      (
                        groups.find(g =>
                          (c.Names ? c.Names[0] : c.Name).startsWith(
                            "/" + g.name
                          )
                        ) || {}
                      )._id
                    }
                  />
                </Grid.Column>
              ))}
            </Grid>
          </>
        )
      :
        (
          <Message>No container found. Use the Create button in the Services tab and refresh the page.</Message>
        )
      }
      </>
    );
  }

  private handleAllOnClick = (state: string) => {
    const { containers, daemon, refresh } = this.props;

    this.setState({ isFetching: state });
    changeContainersStatus(
      daemon._id,
      state,
      this.filterContainers(containers, state).map(c => c.Id)
    )
      .then(() => refresh())
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: "" }));
  };

  private filterContainers = (containers: IContainer[], state: string) => {
    switch (state) {
      case "create":
        return containers.filter(c => !c.Status || c.State === "exited");
      case "start":
        return containers.filter(c => c.State === "exited");
      case "stop":
        return containers.filter(c => c.State === "running");
      default:
        return [] as IContainer[];
    }
  };

  private filterSearch = (_: React.SyntheticEvent, { value }: SearchProps) => {
    this.setState({ searchFilter: value as string });
  };

  private handleTransform = () => {
    const { groupId } = this.props;
    // tslint:disable-next-line: no-unused-expression
    groupId &&
      transformServices(groupId)
        .then(services => console.log(services))
        .catch(error => console.log(error));
  };
}
