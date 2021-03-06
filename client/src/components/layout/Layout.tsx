import "./Layout.css";
import "./Custo.css";

import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import {
  Button,
  Container,
  Icon,
  Image,
  Menu,
  Message,
} from "semantic-ui-react";

import { path } from "../../constants/path";
import { IStoreState } from "../../types/store";
import { IMessage } from "../../types/types";
import { logoutRequestThunk } from "../User/actions/user";
import KonamiCode from "./KonamiCode";

interface ILayoutProps {
  message: IMessage;
  docURL: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  username: string;
  logoutRequest?: () => void;
  children: React.ReactNode;
}

interface ILayoutState {
  showBanner: boolean;
}

class Layout extends React.Component<ILayoutProps, ILayoutState> {
  public state = {
    showBanner: true,
  };

  public render() {
    const { message, docURL, username, isAuthenticated, isAdmin } = this.props;
    const { showBanner } = this.state;

    return (
      <>
        {showBanner && (message.header || message.content) && (
          <Message
            className="banner"
            {...message}
            onDismiss={this.handleDismissBanner}
          />
        )}

        <KonamiCode />
        <Menu size="tiny">
          <Menu.Menu position="left">
            <Menu.Item>
              <Image src="/favicon.png" width="20px" />
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
                    <Icon name="docker" /> Images
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
            {docURL && (
              <Menu.Item>
                <Button
                  basic={true}
                  labelPosition="left"
                  icon="book"
                  content="Docktor user manual"
                  as="a"
                  href={docURL}
                  target="_blank"
                />
              </Menu.Item>
            )}

            <Menu.Item>
              <Button
                labelPosition="right"
                icon="user"
                title="Profile"
                content={isAuthenticated ? username.toUpperCase() : "Login"}
                primary={true}
                as={Link}
                to={isAuthenticated ? path.profile : path.login}
              />
              {isAuthenticated && (
                <Button
                  color="red"
                  icon="sign-out"
                  title="Sign out"
                  as={Link}
                  to={path.login}
                  onClick={this.props.logoutRequest}
                  style={{ marginLeft: 5 }}
                />
              )}
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        <Container>{this.props.children}</Container>
      </>
    );
  }

  private handleDismissBanner = () => {
    this.setState({ showBanner: false });
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { login, config } = state;
  return {
    message: config.config.message || {},
    docURL: config.config.doc_url,
    username: login.username || "",
    isAdmin: login.isAdmin,
    isAuthenticated: login.username !== "",
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, Action>) => ({
  logoutRequest: () => {
    dispatch(logoutRequestThunk());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
