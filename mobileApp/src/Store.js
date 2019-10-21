import { createStore, applyMiddleware, combineReducers, compose } from "redux"
import thunkMiddleware from "redux-thunk"
import { createLogger } from "redux-logger"
import rootReducer from "./reducers/index";
import Navigator, { navMiddleware } from "./navigation/navigator";
// middleware that logs actions
const loggerMiddleware = createLogger({ predicate: (getState, action) => __DEV__ });

const store = configureStore({});

function configureStore(initialState) {
    const enhancer = compose(
        applyMiddleware(
            thunkMiddleware, // lets us dispatch() functions
            loggerMiddleware,
            navMiddleware
        ),
    );
    return createStore(rootReducer, initialState, enhancer);
}

export default store;