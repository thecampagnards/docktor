import 'semantic-ui-css/semantic.min.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/shell/shell';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import Admin from './components/Admin/views/Admin';
import DaemonForm from './components/Daemon/views/DaemonForm';
import DaemonIndex from './components/Daemon/views/DaemonIndex';
import Daemons from './components/Daemon/views/Daemons';
import GroupForm from './components/Group/views/GroupForm';
import GroupIndex from './components/Group/views/GroupIndex';
import Groups from './components/Group/views/Groups';
import Home from './components/Home/views/Home';
import Images from './components/Images/views/Images';
import Layout from './components/layout/Layout';
import Market from './components/Market/views/Market';
import Service from './components/Services/views/Service';
import ServiceForm from './components/Services/views/ServiceForm';
import Services from './components/Services/views/Services';
import { fetchConfig } from './actions/config';
import { validateThunk } from './components/User/actions/user';
import { UserIsAdmin, UserIsAuthenticated, UserIsNotAuthenticated, UserCanCreateAccount } from './components/User/auth';
import Login from './components/User/views/Login';
import Profile from './components/User/views/Profile';
import User from './components/User/views/User';
import UserForm from './components/User/views/UserForm';
import Users from './components/User/views/Users';
import { path } from './constants/path';
import registerServiceWorker from './registerServiceWorker';
import store from './store';

store.dispatch(validateThunk());
store.dispatch(fetchConfig());

ReactDOM.render(
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <Layout>
        <Switch>
          <Route
            exact={true}
            path={path.home}
            component={UserIsAuthenticated(Home)}
          />
          <Route
            exact={true}
            path={path.admin}
            component={UserIsAdmin(Admin)}
          />
          <Route
            exact={true}
            path={path.images}
            component={UserIsAdmin(Images)}
          />
          <Route
            exact={true}
            path={path.market}
            component={UserIsAuthenticated(Market)}
          />

          <Route
            exact={true}
            path={path.groups}
            component={UserIsAuthenticated(Groups)}
          />
          <Route
            exact={true}
            path={path.groupsNew}
            component={UserIsAuthenticated(GroupForm)}
          />
          <Route
            exact={true}
            path={path.groupsMore + "/*"}
            component={UserIsAuthenticated(GroupIndex)}
          />

          <Route
            exact={true}
            path={path.daemons}
            component={UserIsAdmin(Daemons)}
          />
          <Route
            exact={true}
            path={path.daemonsNew}
            component={UserIsAdmin(DaemonForm)}
          />
          <Route
            exact={true}
            path={path.daemonsMore + "/*"}
            component={UserIsAdmin(DaemonIndex)}
          />

          <Route
            exact={true}
            path={path.services}
            component={UserIsAdmin(Services)}
          />
          <Route
            exact={true}
            path={path.servicesNew}
            component={UserIsAdmin(ServiceForm)}
          />
          <Route
            exact={true}
            path={path.servicesMore}
            component={UserIsAdmin(Service)}
          />
          <Route
            exact={true}
            path={path.servicesEdit}
            component={UserIsAdmin(ServiceForm)}
          />

          <Route
            exact={true}
            path={path.users}
            component={UserIsAdmin(Users)}
          />
          <Route
            exact={true}
            path={path.login}
            component={UserIsNotAuthenticated(Login)}
          />
          <Route
            exact={true}
            path={path.profile}
            component={UserIsAuthenticated(Profile)}
          />
          <Route
            exact={true}
            path={path.usersNew}
            component={UserCanCreateAccount(UserForm)}
          />
          <Route
            exact={true}
            path={path.usersProfile}
            component={UserIsAdmin(User)}
          />
          <Redirect to="/" />
        </Switch>
      </Layout>
    </Router>
  </Provider>,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
