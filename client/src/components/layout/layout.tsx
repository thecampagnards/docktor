import './layout.css';

import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Button, Container, Icon, Menu, Message } from 'semantic-ui-react';

import { path } from '../../constants/path';
import { IStoreState } from '../../types/store';
import { logoutRequestThunk } from '../User/actions/user';
import KonamiCode from './KonamiCode';
import { IMessage } from './types/layout';
import { fetchMessage } from './actions/layout';

interface ILayoutProps {
  isAdmin: boolean;
  isAuthenticated: boolean;
  username: string;
  logoutRequest?: () => void;
}

interface ILayoutStates {
  message: IMessage;
}

class Layout extends React.Component<ILayoutProps, ILayoutStates> {
  public state = {
    message: {} as IMessage
  };

  public componentWillMount() {
    fetchMessage().then((message: IMessage) => this.setState({ message }));
  }

  public render() {
    const { username, isAuthenticated, isAdmin } = this.props;
    const { message } = this.state;

    return (
      <>
        {(message.header || message.content) && <Message className="banner" {...message} />}

        <KonamiCode />
        <Menu size="tiny">
          <Menu.Menu position="left">
            <Menu.Item>
              <Button icon={true} onClick={this.goBack}>
                <Icon name="arrow left" /> Previous
              </Button>
            </Menu.Item>
          </Menu.Menu>

          <Menu.Item as={Link} to={path.home} name="home">
            <Icon name="home" /> Home
          </Menu.Item>

          {isAuthenticated && (
            <>
              <Menu.Item as={Link} to={path.market} name="market">
                <Icon name="shopping cart" /> Market
              </Menu.Item>

              <Menu.Item as={Link} to={path.groups} name="groups">
                <Icon name="box" /> Groups
              </Menu.Item>
              {isAdmin && (
                <>
                  <Menu.Item as={Link} to={path.daemons} name="daemons">
                    <Icon name="sitemap" /> Daemons
                  </Menu.Item>

                  <Menu.Item as={Link} to={path.services} name="services">
                    <Icon name="cubes" /> Services
                  </Menu.Item>

                  <Menu.Item as={Link} to={path.images} name="images">
                    <Icon name="tags" /> Images
                  </Menu.Item>

                  <Menu.Item as={Link} to={path.users} name="users">
                    <Icon name="users" /> Users
                  </Menu.Item>

                  <Menu.Item as={Link} to={path.admin} name="admin">
                    <Icon name="cogs" /> Admin
                  </Menu.Item>
                </>
              )}
            </>
          )}
          <Menu.Menu position="right">
            {isAuthenticated && <Menu.Item>{username}</Menu.Item>}
            <Menu.Item>
              <Button
                animated="vertical"
                primary={true}
                as={Link}
                to={isAuthenticated ? path.profile : path.login}
              >
                <Button.Content hidden={true}>
                  {isAuthenticated ? "Profile" : "Login"}
                </Button.Content>
                <Button.Content visible={true}>
                  <Icon name="user" />
                </Button.Content>
              </Button>
              <pre>{" "}</pre>
              {isAuthenticated && (
                <Button
                  color="red"
                  icon="sign-out"
                  as={Link}
                  to={path.login}
                  onClick={this.props.logoutRequest}
                />
              )}
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        <Container>{this.props.children}</Container>
      </>
    );
  }

  private goBack = () => {
    window.history.back();
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { login } = state;
  return {
    username: login.username,
    isAdmin: !!login.isAdmin,
    isAuthenticated: login.username !== ""
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {
    logoutRequest: () => {
      dispatch(logoutRequestThunk());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout);
