import { applyMiddleware, createStore } from 'redux'

import { logger } from 'redux-logger';
import thunk from 'redux-thunk';

import reducers from '../reducers'
import { IStoreState } from '../types/store';

const middlewares = [thunk, logger];

const store = createStore<IStoreState>(
    reducers,
    applyMiddleware(...middlewares),
)

export default store