import * as _ from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Grid, Popup, Search, SearchProps, Segment, Message, List } from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { changeContainersStatus } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import { transformServices } from '../../Group/actions/group';
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
  groups?: IGroup[];
}

interface IContainersGridState {
  images: IImage[];
  networks: string[];

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
    networks: [] as string[],

    searchFilter: "",
    isFetching: "",
    error: Error()
  };

  public componentDidMount() {
    fetchImages().then(images => this.setState({ images }));

    const networks = _.uniq(this.props.containers.map(c => c.HostConfig.NetworkMode)).sort((a,b) => a.length - b.length);
    this.setState({ networks });
  }

  public render() {
    const { daemon, containers, admin, refresh, groupId, groups } = this.props;
    const { isFetching, error, images, networks, searchFilter } = this.state;

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
                        basic={true}
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
                        basic={true}
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
                        basic={true}
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
                        color="black"
                        circular={true}
                        icon="terminal"
                        labelPosition="right"
                        content="VM Terminal"
                        as={Link}
                        to={path.daemonsSSH.replace(":daemonID", daemon._id!)}
                        floated="right"
                      />
                      <Button
                        basic={true}
                        color="teal"
                        circular={true}
                        icon="recycle"
                        title="Transform services (experimental)"
                        onClick={this.handleTransform}
                        floated="right"
                        loading={isFetching === "transform"}
                      />
                    </>
                  )}
                  <Popup
                    trigger={<Button basic={true} content="Networks" floated="right" />}
                    on="click"
                    position="bottom right"
                    wide={true}
                    content={
                      <List>
                        {networks.map(net => (
                          <List.Item key={net}>{net}</List.Item>
                        ))}
                      </List>
                    }
                  />
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
                        groups ? 
                          groups.find(g =>
                            (c.Names ? c.Names[0] : c.Name).startsWith(
                              "/" + g.name
                            )
                          ) || {}
                          :
                          {}
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

  private filterSearch = (event: React.SyntheticEvent, { value }: SearchProps) => {
    this.setState({ searchFilter: value as string });
  };

  private handleTransform = () => {
    const { groupId, refresh } = this.props;
    this.setState({ isFetching: "transform" });
    // tslint:disable-next-line: no-unused-expression
    groupId &&
      transformServices(groupId)
        .then(() => refresh())
        .catch(error => console.log(error))
        .finally(() => this.setState({ isFetching: "" }));
  };
}
