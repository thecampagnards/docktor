import 'semantic-ui-css/semantic.min.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Admin from './components/Admin/views/Admin';
import DaemonForm from './components/Daemon/views/DaemonForm';
import DaemonIndex from './components/Daemon/views/DaemonIndex';
import Daemons from './components/Daemon/views/Daemons';
import GroupForm from './components/Group/views/GroupForm';
import GroupIndex from './components/Group/views/GroupIndex';
import Groups from './components/Group/views/Groups';
import Home from './components/Home/views/Home';
import Layout from './components/layout/layout';
import Market from './components/Market/views/Market';
import Service from './components/Services/views/Service';
import ServiceForm from './components/Services/views/ServiceForm';
import Services from './components/Services/views/Services';
import Login from './components/User/views/Login';
import Profile from './components/User/views/Profile';
import { path } from './constants/path';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Router basename={process.env.PUBLIC_URL}>
    <Layout>
      <Switch>
        <Route exact={true} path={path.home} component={Home} />
        <Route exact={true} path={path.admin} component={Admin} />
        <Route exact={true} path={path.market} component={Market} />


        <Route exact={true} path={path.groups} component={Groups} />
        <Route exact={true} path={path.groupsNew} component={GroupForm} />
        <Route exact={true} path={path.groupsMore + "/*"} component={GroupIndex} />

        <Route exact={true} path={path.daemons} component={Daemons} />
        <Route exact={true} path={path.daemonsNew} component={DaemonForm} />
        <Route exact={true} path={path.daemonsMore + "/*"} component={DaemonIndex} />

        <Route exact={true} path={path.services} component={Services} />
        <Route exact={true} path={path.servicesNew} component={ServiceForm} />
        <Route exact={true} path={path.servicesMore} component={Service} />
        <Route exact={true} path={path.servicesEdit} component={ServiceForm} />

        <Route exact={true} path={path.login} component={Login} />
        <Route exact={true} path={path.profile} component={Profile} />
      </Switch>
    </Layout>
  </Router>
  ,
  document.getElementById("root") as HTMLElement
)
registerServiceWorker()
