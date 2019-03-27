import { combineReducers } from 'redux';

import authReducer from '../components/User/reducers/auth';
import { IStoreState } from '../types/store';

export default combineReducers<IStoreState>({
  login: authReducer,
});
