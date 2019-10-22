import * as React from 'react';
import { Button, Divider, Loader, Message, Progress, Segment, Search, SearchProps, ButtonProps, Grid } from 'semantic-ui-react';

import { IResources, IFileSystem } from '../../Home/types/home';
import { fetchCadvisor } from '../actions/daemon';
import { IDaemon } from '../types/daemon';

interface IDaemonCAdvisorProps {
  daemon: IDaemon;
}

interface IDaemonCAdvisorStates {
  resources: IResources;
  isFetching: boolean;
  error: Error;
  groups: string[];
  filterSource: string;
}

class DaemonCAdvisor extends React.Component<
  IDaemonCAdvisorProps,
  IDaemonCAdvisorStates
> {
  public state = {
    resources: {} as IResources,
    isFetching: true,
    error: Error(),
    groups: [],
    filterSource: ""
  };

  private refreshIntervalId: NodeJS.Timeout;
  private searchFilter = "";

  public componentDidMount() {
    const { daemon } = this.props;

    const fetch = () => {
      fetchCadvisor(daemon._id)
        .then((resources: IResources) => {
          const groups = this.findProjectFilesystems(resources.fs).sort((a,b) => a.localeCompare(b));
          this.setState({ resources, error: Error(), groups })
        })
        .catch((error: Error) => {
          this.setState({ error });
        })
        .finally(() => {
          this.setState({ isFetching: false });
        });
    };

    fetch();
    this.refreshIntervalId = setInterval(fetch, 1000 * 30);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshIntervalId);
  }

  public render() {
    const { resources, error, isFetching, groups, filterSource } = this.state;

    const { daemon } = this.props;

    const fsFiltered = resources.fs ? 
      resources.fs.filter(fs => fs.device.toLowerCase().includes(this.searchFilter.toLowerCase())) :
      [];

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
        <Segment>
          <Grid>
            <Grid.Column width={2}>
              <Search
                size="tiny"
                placeholder="Search filesystems..."
                showNoResults={false}
                name="searchFilter"
                value={this.searchFilter}
                onSearchChange={this.filterBySearch}
                disabled={isFetching}
                floated="left"
              />
            </Grid.Column>
            <Grid.Column width={1}>
              <Button
                basic={true}
                circular={true}
                floated="right"
                icon="cancel"
                title="Clear search filter"
                name=""
                onClick={this.filterByButton}
              />
            </Grid.Column>
            <Grid.Column width={10}>
              <Button.Group basic={true}>
                <Button
                  active={filterSource === "varlibdocker"}
                  content="Varlibdocker"
                  name="varlibdocker"
                  onClick={this.filterByButton}
                />
              {groups.map(g => (
                <Button
                  key={g}
                  active={g === filterSource}
                  content={g}
                  name={g}
                  onClick={this.filterByButton}
                />
              ))}
              </Button.Group>
            </Grid.Column>
            <Grid.Column width={3}>
              <Button
                basic={true}
                color="blue"
                icon="external alternate"
                labelPosition="right"
                content="Open cAdvisor webpage"
                as="a"
                title={daemon.cadvisor}
                href={daemon.cadvisor}
                target="_blank"
                floated="right"
              />
            </Grid.Column>
          </Grid>
        </Segment>
        <h4>Resources</h4>
        <Segment raised={true}>
          <Progress
            value={resources.cpu}
            total={100}
            progress="percent"
            label="CPU"
            className="reverse"
          />
          <Progress
            value={resources.ram}
            total={100}
            progress="percent"
            label="RAM"
            className="reverse"
          />
        </Segment>
        {resources.fs.length > 0 && (
          <>
            <Divider />
            <h4>Filesystems</h4>
          </>
        )}
        {fsFiltered
          .sort((a, b) => a.device.localeCompare(b.device))
          .map(s => {
            const capGo = Math.round(s.capacity / 1000000) / 1000;
            const usageGo = Math.round(s.usage / 1000000) / 1000;
            const percent = Math.round((100 * usageGo) / capGo);
            return (
              <Segment key={s.device}>
                <Progress
                  value={percent}
                  total={100}
                  progress="percent"
                  label={"Disk - " + s.device}
                  title={`${usageGo}/${capGo}Go`}
                  className="reverse"
                />
              </Segment>
            );
          })}
      </>
    );
  }

  private filterByButton = (
    event: React.SyntheticEvent,
    { name }: ButtonProps
  ) => {
    this.setState({ filterSource: name });
    this.filter(name);
  }

  private filterBySearch = (
    event: React.SyntheticEvent,
    { value }: SearchProps
  ) => {
    this.setState({ filterSource: "search" });
    this.filter(value || "");
  };

  private filter = (text: string) => {
    this.searchFilter = text;
  }

  private findProjectFilesystems = (filesystems: IFileSystem[]) => {
    const prjRegex = /^\/dev\/mapper\/vstorage-(cdk)?(data)?[_-]*([A-Z0-9_-]+)$/;
    const projects: string[] = [];
    filesystems.forEach(fs => {
      if ( prjRegex.test(fs.device)) {
        const match = prjRegex.exec(fs.device);
        if (match != null) {
          projects.push(match[3]);
        }
      }
    })
    return projects;
  }
}

export default DaemonCAdvisor;
