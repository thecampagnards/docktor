import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";

import { path } from "./constants/path";
import registerServiceWorker from "./registerServiceWorker";
import store from "./store";

import Home from "./views/Home/Home";
import Groups from "./views/Groups/Groups";
import Group from "./views/Groups/Group";

import Daemons from "./views/Daemons/Daemons";
import Daemon from "./views/Daemons/Daemon";
import DaemonForm from "./views/Daemons/DaemonForm";

ReactDOM.render(
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <Switch>
        <Route exact={true} path={path.home} component={Home} />
        <Route exact={true} path={path.groups} component={Groups} />
        <Route exact={true} path={path.groupsMore + '/:groupID'} component={Group} />
        <Route exact={true} path={path.groupsEdit + '/:groupID'} component={Group} />

        <Route exact={true} path={path.daemons} component={Daemons} />
        <Route exact={true} path={path.daemonsMore + '/:daemonID'} component={Daemon} />
        <Route exact={true} path={path.daemonsEdit + '/:daemonID'} component={DaemonForm} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
