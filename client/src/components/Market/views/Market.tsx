import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, ButtonProps, Grid, Loader, Message, Search, SearchProps } from 'semantic-ui-react';

import { IStoreState } from '../../../types/store';
import { fetchGroup, fetchGroups } from '../../Group/actions/group';
import { IGroup } from '../../Group/types/group';
import { fetchServices } from '../../Services/actions/service';
import { IService } from '../../Services/types/service';
import MarketCard from './MarketCard';

interface IMarketProps {
  isAdmin: boolean;
  username: string;
}

interface IServicesStates {
  services: IService[];
  servicesFiltered: IService[];
  tagsFilter: string[];
  groups: IGroup[];
  isFetching: boolean;
  error: Error;
}

class Market extends React.Component<
  IMarketProps & RouteComponentProps<{}>,
  IServicesStates
> {
  public state = {
    services: [] as IService[],
    servicesFiltered: [] as IService[],
    tagsFilter: [] as string[],
    groups: [] as IGroup[],
    isFetching: true,
    error: Error()
  };

  private searchField = "";

  public componentDidMount() {
    fetchServices()
      .then((services: IService[]) =>
        this.setState({
          services,
          servicesFiltered: services,
          isFetching: false
        })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));

    const url = new URL(
      "http://dummy.url" +
        this.props.location.pathname +
        this.props.location.search
    );
    if (url.searchParams.has("group")) {
      const groupID = url.searchParams.get("group") as string;
      fetchGroup(groupID)
        .then((group: IGroup) => this.setState({ groups: [group] }))
        .catch((error: Error) => this.setState({ error }));
    } else {
      fetchGroups(false)
        .then(
          (groups: IGroup[]) =>
            groups &&
            this.setState({
              groups: groups.filter(
                (g: IGroup) =>
                  this.props.isAdmin || g.admins.includes(this.props.username)
              )
            })
        )
        .catch((error: Error) => this.setState({ error }));
    }
  }

  public render() {
    const { isAdmin } = this.props;
    const {
      services,
      servicesFiltered,
      tagsFilter,
      groups,
      error,
      isFetching
    } = this.state;

    if (error.message) {
      return (
        <>
          <h2>Market</h2>
          <Message negative={true}>
            <Message.Header>Failed to load data with error :</Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    if (isFetching) {
      return (
        <>
          <h2>Market</h2>
          <Loader active={true} />
        </>
      );
    }

    let tags: string[] = [];
    for (const s of services) {
      tags = _.union(tags, s.tags);
    }

    return (
      <>
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
            {tags.map(tag => (
              <Button
                key={tag}
                basic={true}
                toggle={true}
                active={tagsFilter.indexOf(tag) > -1}
                onClick={this.filterAddTags}
                value={tag}
              >
                {tag}
              </Button>
            ))}
          </Grid.Column>
        </Grid>
        <Grid verticalAlign="middle">
          {servicesFiltered.map((service: IService) => 
            (isAdmin || !service.admin) && 
              (
                <Grid.Column key={service._id} width={4}>
                  <MarketCard
                    groups={groups}
                    service={service}
                    admin={isAdmin}
                  />
                </Grid.Column>
              )
          )}
        </Grid>
      </>
    );
  }

  private filter = () => {
    const { tagsFilter } = this.state;

    let servicesFiltered = this.state.services.filter(service =>
      service.name.toLowerCase().includes(this.searchField.toLowerCase())
    );
    if (tagsFilter.length > 0) {
      servicesFiltered = servicesFiltered.filter(
        s => _.intersectionWith(s.tags, tagsFilter, _.isEqual).length !== 0
      );
    }
    this.setState({ servicesFiltered });
  };

  private filterAddSearchField = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    this.searchField = value as string;
    this.filter();
  };

  private filterAddTags = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    { value }: ButtonProps
  ) => {
    const { tagsFilter } = this.state;
    const index = tagsFilter.indexOf(value);
    index === -1 ? tagsFilter.push(value) : tagsFilter.splice(index, 1);
    this.setState({ tagsFilter });
    this.filter();
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { login } = state;
  return {
    isAdmin: login.isAdmin,
    username: login.username || ""
  };
};

export default withRouter(connect(mapStateToProps)(Market));
