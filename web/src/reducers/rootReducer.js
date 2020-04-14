import { combineReducers } from 'redux';
import userReducer from './userReducer';
import studioReducer, { undoableStateReducer } from './studioReducer';
import notificationsReducer from './notificationsReducer';

export default combineReducers({
  user: userReducer,
  studio: studioReducer,
  studioUndoable: undoableStateReducer,
  notifications: notificationsReducer,
});
