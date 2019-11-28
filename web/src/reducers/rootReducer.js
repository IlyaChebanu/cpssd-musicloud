import { combineReducers } from 'redux';
import userReducer from './userReducer';
import studioReducer from './studioReducer';
import notificationsReducer from './notificationsReducer';

export default combineReducers({
  user: userReducer,
  studio: studioReducer,
  notifications: notificationsReducer,
});
