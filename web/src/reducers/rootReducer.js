import { combineReducers } from 'redux';
import userReducer from './userReducer';
import studioReducer from './studioReducer';

export default combineReducers({
  user: userReducer,
  studio: studioReducer,
});