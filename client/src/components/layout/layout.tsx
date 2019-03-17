import './layout.css';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Icon, Menu } from 'semantic-ui-react';

import { path } from '../../constants/path';
import auth from '../User/actions/user';
import KonamiCode from './KonamiCode';

class Layout extends React.Component {
  public render() {

    const user = auth.getUser()

    return (
      <>
        <KonamiCode />
        <Menu size="tiny">
          <Menu.Menu position="left">
            <Menu.Item>
              <Button icon={true} onClick={this.goBack}><Icon name="arrow left" /> Previous</Button>
            </Menu.Item>
          </Menu.Menu>

          <Menu.Item as={Link} to={path.home} name="home">
            <Icon name="home" /> Home
          </Menu.Item>

          <Menu.Item as={Link} to={path.market} name="market">
            <Icon name="shopping cart" /> Market
          </Menu.Item>

          <Menu.Item as={Link} to={path.groups} name="groups">
            <Icon name="users" /> Groups
          </Menu.Item>

          <Menu.Item as={Link} to={path.daemons} name="daemons">
            <Icon name="sitemap" /> Daemons
          </Menu.Item>

          <Menu.Item as={Link} to={path.services} name="services">
            <Icon name="cubes" /> Services
          </Menu.Item>

          <Menu.Item as={Link} to={path.users} name="users">
            <Icon name="users" /> Users
          </Menu.Item>

          <Menu.Item as={Link} to={path.admin} name="admin">
            <Icon name="cogs" /> Admin
          </Menu.Item>

          <Menu.Menu position="right">
            {user &&
            <Menu.Item>
              <Button color="red" as={Link} to={path.login} onClick={auth.signOut}>Logout</Button>
            </Menu.Item>
          }
            <Menu.Item>
              <Button animated="vertical" primary={true} as={Link} to={user ? path.profile : path.login}>
                <Button.Content hidden={true}>{user ? user.Username : "Login"}</Button.Content>
                <Button.Content visible={true}><Icon name="user" /></Button.Content>
              </Button>
            </Menu.Item>
          </Menu.Menu>

        </Menu>

        <Container>
          {this.props.children}
        </Container>
      </>
    )
  }

  private goBack = () => {
    window.history.back()
  }
}

export default Layout