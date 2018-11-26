import * as React from "react";
import { Link } from "react-router-dom";
import { Button, Dropdown, Grid, Icon, Menu } from "semantic-ui-react";

import { path } from "../../constants/path";

class Layout extends React.Component {
  public render() {
    return (
      <>
        <Menu size="tiny">
          <Menu.Menu position="left">
            <Menu.Item>
              <Button icon={true} onClick={this.goBack}><Icon name='arrow left'/> Previous</Button>
            </Menu.Item>
          </Menu.Menu>

          <Menu.Item as={Link} to={path.home} name="home" />

          <Menu.Menu position="right">
            <Dropdown item={true} text="Language">
              <Dropdown.Menu>
                <Dropdown.Item>English</Dropdown.Item>
                <Dropdown.Item>Russian</Dropdown.Item>
                <Dropdown.Item>Spanish</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Menu.Item>
              <Button primary={true}>Sign Up</Button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        <Grid divided="vertically" columns={2}>
            <Grid.Column width={3}>
              <Menu vertical={true}>

                <Menu.Item as={Link} to={path.home}>
                <Icon name="home" />

                  Home
                </Menu.Item>

                                <Menu.Item as={Link} to={path.market}>
                <Icon name="shopping cart" />

                  Market
                </Menu.Item>

                <Menu.Item as={Link} to={path.groups} name="Groups">
                <Icon name="users" />

                  Groups
                </Menu.Item>
                <Menu.Item as={Link} to={path.daemons} name="Daemons">
                  <Icon name="sitemap" />

                  Daemons
                </Menu.Item>
                <Menu.Item as={Link} to={path.services} name="Services">
                  <Icon name="cubes" />

                  Services
                </Menu.Item>
              </Menu>
            </Grid.Column>
            <Grid.Column>
              {this.props.children}
            </Grid.Column>
        </Grid>
      </>
    );
  }

  private goBack = () => {
    window.history.back();
  };
}

export default Layout;