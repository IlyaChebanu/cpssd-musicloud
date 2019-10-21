import * as Actions from '../actions/actionTypes'

let initialState = { token: '', };

const HomeReducer = (state = initialState, action) => {

    switch (action.type) {
        case Actions.SET_AUTH_TOKEN:
            return Object.assign({}, state, {
                token: action.token
            });
        default:
            return state;
    }
};

export default HomeReducer;