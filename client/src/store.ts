import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import reducers from './reducers/index';
import { IStoreState } from './types/store';

const middlewares = [thunk];

export default createStore<IStoreState, any, any, any>(
  reducers,
  applyMiddleware(...middlewares)
);
