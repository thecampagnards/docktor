import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { Divider, Loader, Grid, Card, List, Menu, Button, Label, Icon, Popup } from 'semantic-ui-react';

import { IDaemon } from '../../Daemon/types/daemon';
import { IGroup } from '../types/group';
import { Link } from 'react-router-dom';
import { path } from '../../../constants/path';
import { getDockerStatus } from '../../Daemon/views/Daemons';

interface IGroupSummaryProps {
    group: IGroup;
    daemon: IDaemon;
    admin: boolean;
    indexRefresh: (path: string) => void;
}

interface IGroupSummaryStates {
    isFetching: boolean;
    error: Error;
}

class GroupSummary extends React.Component<IGroupSummaryProps,IGroupSummaryStates> {
  public state = {
    isFetching: false,
    error: Error()
  };

  public render() {
    const { group, daemon, admin, indexRefresh } = this.props;
    const { isFetching } = this.state;

    if (isFetching) {
        return <Loader active={true}>Loading data</Loader>;
    }

    return (
        <>
          {daemon &&
            <Menu borderless={true} size="small">
              <Menu.Item>
                <Popup
                  trigger={
                    <Button basic={true} icon={true} labelPosition="right">
                      {daemon.host}
                      {getDockerStatus(daemon.docker.status)}
                    </Button>
                  }
                  on="click"
                  content="The icon indicates the current status of the VM's Docker daemon."
                />
              </Menu.Item>
              <Menu.Item>{daemon.tags.map(t => <Label key={t} color="blue">{t.toUpperCase()}</Label>)}</Menu.Item>
              {admin &&
                <Menu.Menu position="right">
                  <Menu.Item>
                    <Button.Group basic={true} compact={true} floated="right">
                      <Button icon="docker" title="Daemon summary" as={Link} to={path.daemonsSummary.replace(":daemonID", daemon._id)} />
                      <Button icon="block layout" title="Daemon containers" as={Link} to={path.daemonsContainers.replace(":daemonID", daemon._id)} />
                      <Button icon="server" title="Daemon cAdvisor" as={Link} to={path.daemonsCAdvisor.replace(":daemonID", daemon._id)} />
                      <Button icon="terminal" title="Daemon SSH" as={Link} to={path.daemonsSSH.replace(":daemonID", daemon._id)} />
                      <Button icon="edit" title="Daemon configuration" as={Link} to={path.daemonsEdit.replace(":daemonID", daemon._id)} />
                    </Button.Group>
                  </Menu.Item>
                </Menu.Menu>
              }
            </Menu>
          }

          <Grid>
            <Grid.Row>

            <Grid.Column width={2}>
              <Card>
                <Card.Content>
                  <Card.Header as ="a" onClick={indexRefresh.bind(this, path.groupsServices.replace(":groupID", group._id))}>
                    Services
                  </Card.Header>
                </Card.Content>
                <Card.Content>
                  <List>
                    {group.services && group.services.length !== 0 ?
                      group.services.map(s =>
                        <List.Item key={s.name} as="a" href={s.url} target="_blank" icon={true}>
                          <List.Icon name="chain" /> {s.name}
                        </List.Item>
                      )
                      :
                      <List.Item content="No service in this group." />
                    }
                  </List>
                </Card.Content>
              </Card>
            </Grid.Column>

            <Grid.Column width={2}>
              <Card>
                <Card.Content>
                  <Card.Header as ="a" onClick={indexRefresh.bind(this, path.groupsMembers.replace(":groupID", group._id))}>
                    Members
                  </Card.Header>
                </Card.Content>
                <Card.Content>
                  <List>
                    {group.admins && group.admins.length !== 0 ?
                      group.admins.map(m => <List.Item key={m} icon={true} style={{ fontWeight: "bold" }}><List.Icon name="user plus" title="Group administrator" /> {m}</List.Item>)
                      :
                      <List.Item content="This group has no admin !" />
                    }
                  </List>
                </Card.Content>
                <Card.Content>
                  <List>
                    {group.users && group.users.length !== 0 ?
                      group.users.map(m => <List.Item key={m} icon={true}><List.Icon name="user outline" title="Group member" /> {m}</List.Item>)
                      :
                      <List.Item content="This group has no other user." />
                    }
                  </List>
                </Card.Content>
              </Card>
            </Grid.Column>

            <Grid.Column width={1}>
              <Divider vertical={true}><Icon name="info" /></Divider>
            </Grid.Column>

            <Grid.Column width={11}>
              <h4>Description</h4>
              {group.description ?
                <ReactMarkdown source={group.description} escapeHtml={false} />
                :
                <span>No description provided.</span>
              }
            </Grid.Column>

            </Grid.Row>
          </Grid>
        </>
      );

  }

}
export default GroupSummary;