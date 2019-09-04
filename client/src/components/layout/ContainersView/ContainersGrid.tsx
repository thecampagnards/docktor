import * as React from 'react';
import {
    Button, Grid, Search, SearchProps, Segment
} from 'semantic-ui-react';

import { changeContainersStatus } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import { fetchImages } from '../../Images/actions/image';
import { IImage } from '../../Images/types/image';
import ContainerCard from './ContainerCard';
import { Link } from 'react-router-dom';
import { path } from '../../../constants/path';

interface IContainerGridProps {
  daemon: IDaemon;
  admin: boolean;
  containers: IContainer[];
  refresh: () => void;
  groupId?: string;
}

interface IContainerGridState {
  images: IImage[];

  searchFilter: string;
  isFetching: string;
  error: Error;
}

export default class ContainerGrid extends React.Component<
  IContainerGridProps,
  IContainerGridState
> {
  public state = {
    images: [] as IImage[],

    searchFilter: "",
    isFetching: "",
    error: Error(),
  };

  public componentDidMount() {
    fetchImages().then(images => this.setState({ images }));
  }

  public render() {
    const { daemon, containers, admin, refresh, groupId } = this.props;
    const { isFetching, error, images, searchFilter } = this.state;

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
        {containers.length > 0 && (
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
              </Grid.Column>
              <Grid.Column width={4}>
                {groupId && admin && (
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
                )}
              </Grid.Column>
            </Grid>
          </Segment>

          <Grid className="three column grid">
            {containersFiltered.map((c: IContainer) => (
              <Grid.Column key={c.Id}>
                <ContainerCard container={c} images={images.filter(i => RegExp(i.image.Pattern).test(c.Image))} admin={admin} daemon={daemon} refresh={refresh} groupId={groupId} />
              </Grid.Column>
              )
            )}
          </Grid>

          </>
        )}
      </>
    );
  }

  private handleAllOnClick = (state: string) => {
    const { containers, daemon, refresh } = this.props;
    
    this.setState({ isFetching: state });
    changeContainersStatus(daemon._id, state, containers.map(c => c.Id))
      .then(() => refresh())
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: "" }));
  };

  private filterSearch = (_: React.SyntheticEvent, { value }: SearchProps) => {
    this.setState({ searchFilter: value as string });
  };
}
