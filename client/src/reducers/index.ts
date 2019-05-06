import { combineReducers } from 'redux';

import authReducer from '../components/User/reducers/auth';
import { IStoreState } from '../types/store';
import configReducer from './config';

export default combineReducers<IStoreState>({
  login: authReducer,
  config: configReducer
});
