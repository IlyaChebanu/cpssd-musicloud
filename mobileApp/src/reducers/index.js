import { combineReducers } from "redux";
import * as actionsTypes from '../actions/actionTypes';

import { DummyReducer } from "./dummyReducer";
import { NavReducer } from "./navReducers";
import HomeReducer from "./homeReducer";
import RegistrationReducer from "./registrationReducer";
//Here you import all your different reducers and combine them into ONE

const appReducer = combineReducers({
    dummy: DummyReducer,
    nav: NavReducer,
    home: HomeReducer,
    reg: RegistrationReducer,
  });

const rootReducer = (state, action) => {
    if (action.type === actionsTypes.CLEAR_REDUX_STATE) {
      state = undefined
    }
    return appReducer(state, action);
};

export default rootReducer;