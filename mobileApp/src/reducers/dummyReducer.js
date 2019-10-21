import * as Actions from "../actions/actionTypes"

let initialState = {};

export const DummyReducer = (state = { }, action) => {

    switch (action.type) {
        case Actions.SET_DUMMY_NAME:
            return Object.assign({}, state, {
                setDummyName: action.setDummyName
            });
        default:
            return state;
    }
};