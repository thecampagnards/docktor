import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { Divider, Loader, Grid, Card, List, Menu, Button, Label } from 'semantic-ui-react';

import { IDaemon } from '../../Daemon/types/daemon';
import { IGroup } from '../types/group';
import { Link } from 'react-router-dom';
import { path } from '../../../constants/path';

interface IGroupSummaryProps {
    group: IGroup;
    daemon: IDaemon;
    admin: boolean;
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
    const { group, daemon, admin } = this.props;
    const { isFetching } = this.state;

    if (isFetching) {
        return <Loader active={true}>Loading data</Loader>;
    }

    return (
        <>
          {daemon &&
            <Menu borderless={true}>
              <Menu.Item>{daemon.host}</Menu.Item>
              <Menu.Item><Label content={"Status : " + daemon.docker.status} /></Menu.Item>
              {admin &&
                <Menu.Menu position="right">
                  <Menu.Item>
                    <Button.Group basic={true} floated="right">
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

          <ReactMarkdown source={group.description} escapeHtml={false} />
          <Divider />

          <Grid>
            <Grid.Row>
              <Grid.Column width={3}>
                <Card>
                  <Card.Content>
                    <Card.Header as={Link} to={path.groupsServices.replace(":groupID", group._id)}>
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
              <Grid.Column width={3}>
                <Card>
                  <Card.Content>
                    <Card.Header as={Link} to={path.groupsMembers.replace(":groupID", group._id)}>
                      Members
                    </Card.Header>
                  </Card.Content>
                  <Card.Content>
                    <List>
                      {group.admins && group.admins.length !== 0 ?
                        group.admins.map(m => <List.Item key={m} icon={true}><List.Icon name="user plus" title="Group administrator" /> {m}</List.Item>)
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
            </Grid.Row>
          </Grid>
        </>
      );

  }

}
export default GroupSummary;