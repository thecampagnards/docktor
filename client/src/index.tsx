import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";

import { path } from "./constants/path";
import registerServiceWorker from "./registerServiceWorker";

import Home from "./components/Home/views/Home";
import Market from './components/Market/views/Market';

import GroupIndex from "./components/Group/views/GroupIndex";
import Groups from './components/Group/views/Groups';

import Daemons from "./components/Daemon/views/Daemons";
import Daemon from "./components/Daemon/views/Daemon";
import DaemonForm from "./components/Daemon/views/DaemonForm";

import Services from './components/Services/views/Services';
import Service from './components/Services/views/Service';
import ServiceForm from './components/Services/views/ServiceForm';

ReactDOM.render(
    <Router basename={process.env.PUBLIC_URL}>
      <Switch>
      <Route exact={true} path={path.home} component={Home} />
      <Route exact={true} path={path.market} component={Market} />

        <Route exact={true} path={path.groups} component={Groups} />
        <Route exact={true} path={path.groupsMore + '*'} component={GroupIndex} />

        <Route exact={true} path={path.daemons} component={Daemons} />
        <Route exact={true} path={path.daemonsMore} component={Daemon} />
        <Route exact={true} path={path.daemonsEdit} component={DaemonForm} />

        <Route exact={true} path={path.services} component={Services} />
        <Route exact={true} path={path.servicesMore} component={Service} />
        <Route exact={true} path={path.servicesEdit} component={ServiceForm} />
      </Switch>
    </Router>,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
