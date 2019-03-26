import { compose } from 'redux';
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';

import { path } from '../../../constants/path';
import { IStoreState } from '../../../types/store';

const locationHelper = locationHelperBuilder({});

// Redirect to the homepage if the user is authenticated
export const UserIsNotAuthenticated = connectedRouterRedirect<any, IStoreState>(
  {
    allowRedirectBack: false,
    authenticatedSelector: state => state.login.username === "",
    redirectPath: (state, ownProps) =>
      locationHelper.getRedirectQueryParam(ownProps) || path.home,
    wrapperDisplayName: "UserIsNotAuthenticated",
  },
);

// Redirect to the login page if the user is not authenticated
export const UserIsAuthenticated = connectedRouterRedirect<any, IStoreState>({
  authenticatedSelector: state => state.login.username !== "",
  redirectPath: path.login,
  wrapperDisplayName: "UserIsAuthenticated",
});

// Redirect to the homepage if the user is not admin
export const UserIsAdmin = compose(
  UserIsAuthenticated,
  connectedRouterRedirect<any, IStoreState>({
    allowRedirectBack: false,
    authenticatedSelector: state =>
      state.login.username !== "" && state.login.isAdmin,
    redirectPath: path.home,
    wrapperDisplayName: "UserIsAdmin",
  }),
);