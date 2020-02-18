import * as Actions from '../actions/actionTypes'

let initialState = { token: '', username: '', isOnline: true, };

const HomeReducer = (state = initialState, action) => {

    switch (action.type) {
        case Actions.SET_AUTH_TOKEN:
            return Object.assign({}, state, {
                token: action.token
            });
        case Actions.SET_USERNAME:
            return Object.assign({}, state, {
                username: action.username
            });
        case Actions.SET_ONLINE_STATUS:
            return Object.assign({}, state, {
                isOnline: action.isOnline
            });
        default:
            return state;
    }
};

export default HomeReducer;