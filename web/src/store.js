import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import audioMiddleware from './middleware/audioRedux';
import rootReducer from './reducers';

const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__() : a => a;

export default createStore(
  rootReducer,
  compose(
    applyMiddleware(thunk, audioMiddleware),
    devTools,
  )
);