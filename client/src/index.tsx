import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";

import { path } from "./constants/path";
import registerServiceWorker from "./registerServiceWorker";

import Home from "./components/Home/views/Home";

import Groups from "./components/Group/views/Groups";
import Group from "./components/Group/views/Group";

import Daemons from "./components/Daemon/views/Daemons";
import Daemon from "./components/Daemon/views/Daemon";
import DaemonForm from "./components/Daemon/views/DaemonForm";

import Services from './components/Services/views/Serivces';

ReactDOM.render(
    <Router basename={process.env.PUBLIC_URL}>
      <Switch>
        <Route exact={true} path={path.home} component={Home} />
        <Route exact={true} path={path.groups} component={Groups} />
        <Route exact={true} path={path.groupsMore + '/:groupID'} component={Group} />
        <Route exact={true} path={path.groupsEdit + '/:groupID'} component={Group} />

        <Route exact={true} path={path.daemons} component={Daemons} />
        <Route exact={true} path={path.daemonsMore + '/:daemonID'} component={Daemon} />
        <Route exact={true} path={path.daemonsEdit + '/:daemonID'} component={DaemonForm} />

        <Route exact={true} path={path.services} component={Services} />
      </Switch>
    </Router>,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
