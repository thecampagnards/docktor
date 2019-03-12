import * as React from "react";
import * as _ from 'lodash';
import { Button, Grid, Loader, Search, ButtonProps, SearchProps } from "semantic-ui-react";

import Layout from "../../layout/layout";
import MarketCard from './MarketCard';

import { IService } from "../../Services/types/service";
import { fetchServices } from "../../Services/actions/service";

import { IGroup } from "../../Group/types/group";
import { fetchGroups } from "../../Group/actions/group";

interface IServicesStates {
  services: IService[];
  servicesFiltered: IService[];
  tagsFilter: string[];
  groups: IGroup[];
  isFetching: boolean;
  error: Error | null;
}

class Market extends React.Component<{}, IServicesStates> {
  public state = {
    services: [] as IService[],
    servicesFiltered: [] as IService[],
    tagsFilter: [] as string[],
    groups: [] as IGroup[],
    isFetching: false,
    error: null
  };

  private searchField = ""

  public componentWillMount() {
    fetchServices()
      .then((services: IService[]) =>
        this.setState({ services, servicesFiltered: services, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    fetchGroups()
      .then((groups: IGroup[]) => this.setState({ groups }))
      .catch((error: Error) => this.setState({ error }));
  }

  public render() {
    const { services, servicesFiltered, tagsFilter, groups, error, isFetching } = this.state;

    if (!services) {
      return (
        <Layout>
          <h2>Market</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }

    if (error) {
      return (
        <Layout>
          <h2>Market</h2>
          <p>{(error as Error).message}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Market</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    let tags: string[] = []
    for (const s of services) {
      tags = _.union(tags, s.Tags)
    }

    return (
      <Layout>
        <Grid>
          <Grid.Column width={2}>
            <h2>Market</h2>
          </Grid.Column>
          <Grid.Column width={4}>
            <Search
              size="tiny"
              placeholder="Search services..."
              showNoResults={false}
              onSearchChange={this.filterAddSearchField}
            />
          </Grid.Column>
          <Grid.Column width={10}>
            {tags.map(tag =>
              <Button key={tag} toggle={true} active={tagsFilter.indexOf(tag) > -1} onClick={this.filterAddTags} value={tag}>{tag}</Button>
            )}
          </Grid.Column>
        </Grid>
        <Grid columns="equal">
          {servicesFiltered.map((service: IService) => (
            <Grid.Column key={service._id}>
              <MarketCard groups={groups} service={service} />
            </Grid.Column>
          ))}
        </Grid>
      </Layout>
    );
  }

  private filter = () => {
    const { tagsFilter } = this.state

    let servicesFiltered = this.state.services.filter(service => service.Name.toLowerCase().includes(this.searchField.toLowerCase()))
    if (tagsFilter.length > 0) {
      servicesFiltered = servicesFiltered.filter(s => _.intersectionWith(s.Tags, tagsFilter, _.isEqual).length !== 0)
    }
    this.setState({ servicesFiltered })
  }

  private filterAddSearchField = (event: React.SyntheticEvent, { value }: SearchProps) => {
    this.searchField = value as string
    this.filter()
  }

  private filterAddTags = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, { value }: ButtonProps) => {
    const { tagsFilter } = this.state
    const index = tagsFilter.indexOf(value)
    index === -1 ? tagsFilter.push(value) : tagsFilter.splice(index, 1)
    this.setState({ tagsFilter })
    this.filter()
  }
}

export default Market;
