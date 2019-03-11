import * as React from "react";
import { Link } from "react-router-dom";
import { Button, Container, Dropdown, Icon, Menu } from "semantic-ui-react";

import KonamiCode from './KonamiCode';

import { path } from "../../constants/path";
import './layout.css'

class Layout extends React.Component {
  public render() {
    return (
      <>
        <KonamiCode />
        <Menu size="tiny">
          <Menu.Menu position="left">
            <Menu.Item>
              <Button icon={true} onClick={this.goBack}><Icon name='arrow left' /> Previous</Button>
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

          <Menu.Item as={Link} to={path.admin} name="admin">
            <Icon name="cogs" /> Admin
          </Menu.Item>

          <Menu.Menu position="right">
            <Dropdown item={true} text="Language">
              <Dropdown.Menu>
                <Dropdown.Item>English</Dropdown.Item>
                <Dropdown.Item>Russian</Dropdown.Item>
                <Dropdown.Item>Spanish</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Menu.Item>
              <Button animated='vertical' primary={true} as={Link} to={path.login}>
                <Button.Content hidden={true}>Login</Button.Content>
                <Button.Content visible={true}><Icon name='user' /></Button.Content>
              </Button>
            </Menu.Item>
          </Menu.Menu>

        </Menu>

        <Container>
          {this.props.children}
        </Container>
      </>
    );
  }

  private goBack = () => {
    window.history.back();
  };
}

export default Layout;