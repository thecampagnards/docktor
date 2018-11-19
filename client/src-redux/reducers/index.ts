import { combineReducers } from 'redux';

import { IStoreState } from '../types/store';

import todoReducer from './todo';
import daemonsReducer from './daemons';
import daemonReducer from './daemon';

export default combineReducers<IStoreState>({
    todo: todoReducer,
    daemons: daemonsReducer,
    daemon: daemonReducer,
});
