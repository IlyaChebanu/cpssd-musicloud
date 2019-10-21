import { combineReducers } from "redux";

import { DummyReducer } from "./dummyReducer";
import { NavReducer } from "./navReducers";
//Here you import all your different reducers and combine them into ONE

const appReducer = combineReducers({
    dummy: DummyReducer,
    nav: NavReducer,
  });

const rootReducer = (state, action) => {
    return appReducer(state, action);
};

export default rootReducer;