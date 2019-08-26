import * as React from 'react';
import {
    Button, Grid, Popup, Search, SearchProps
} from 'semantic-ui-react';

import { changeContainersStatus } from '../../Daemon/actions/daemon';
import { IContainer, IDaemon } from '../../Daemon/types/daemon';
import { fetchImages } from '../../Images/actions/image';
import { IImage } from '../../Images/types/image';
import ContainerCard from '../ContainerCard';

interface IContainerGridProps {
  daemon: IDaemon;
  admin: boolean;
  containers: IContainer[];
}

interface IContainerGridState {
  images: IImage[];

  searchFilter: string;
  isFetching: boolean;
  error: Error;
}

export default class ContainerGrid extends React.Component<
  IContainerGridProps,
  IContainerGridState
> {
  public state = {
    images: [] as IImage[],

    searchFilter: "",
    isFetching: false,
    error: Error()
  };

  public componentDidMount() {
    fetchImages().then(images => this.setState({ images }));
  }

  public render() {
    const { daemon, containers, admin } = this.props;
    const { isFetching, error, images, searchFilter } = this.state;

    // filter containers
    let containersFiltered =
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
          <Grid>
            <Grid.Column width={4}>
              <Search
                size="tiny"
                placeholder="Search containers..."
                showNoResults={false}
                onSearchChange={this.filterSearch}
                value={searchFilter}
              />
            </Grid.Column>
            <Grid.Column width={6} />
            <Grid.Column width={6}>
              <Button
                color="green"
                circular={true}
                icon="play"
                disabled={isFetching}
                onClick={this.handleAllOnClick.bind(this, "start")}
              />
              <Button
                color="orange"
                circular={true}
                icon="stop"
                disabled={isFetching}
                onClick={this.handleAllOnClick.bind(this, "stop")}
              />
              <Button
                color="blue"
                circular={true}
                icon="sliders"
                disabled={isFetching}
                onClick={this.handleAllOnClick.bind(this, "create")}
              />
              <Button
                color="teal"
                circular={true}
                icon="save"
                floated="right"
              />
            </Grid.Column>
            {containersFiltered.map((c: IContainer) => (
              <Grid.Column width={5} key={c.Id}>
                <ContainerCard container={c} images={images} admin={admin} />
              </Grid.Column>
              )
            )}
          </Grid>
        )}
      </>
    );
  }

  private handleAllOnClick = (state: string) => {
    const { containers, daemon } = this.props;

    this.setState({ isFetching: true });
    changeContainersStatus(daemon._id, state, containers.map(c => c.Id))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };

  private allowShell = (container: IContainer): boolean => {
    if (this.props.admin) {
      return true;
    }

    const { images } = this.state;

    for (const image of images) {
      if (
        RegExp(image.image.Pattern).test(container.Image) &&
        image.is_allow_shell
      ) {
        return true;
      }
    }
    return false;
  };

  private filterSearch = (_: React.SyntheticEvent, { value }: SearchProps) => {
    this.setState({ searchFilter: value as string });
  };
}
