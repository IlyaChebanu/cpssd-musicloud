import * as Actions from '../actions/actionTypes'

let initialState = { token: '', username: '', isOnline: true, sortingType: '', sortingOrd: '', searchTerm: '', };

const HomeReducer = (state = initialState, action) => {

    switch (action.type) {
        case Actions.SET_AUTH_TOKEN:
            return Object.assign({}, state, {
                token: action.token
            });
        case Actions.SET_DEVICE_TOKEN:
            return Object.assign({}, state, {
                deviceToken: action.deviceToken
            });
        case Actions.SET_USERNAME:
            return Object.assign({}, state, {
                username: action.username
            });
        case Actions.SET_ONLINE_STATUS:
            return Object.assign({}, state, {
                isOnline: action.isOnline
            });
        case Actions.SET_SORTING_TYPE:
            return Object.assign({}, state, {
                sortingType: action.sortingType
            });
        case Actions.SET_SORTING_ORDER:
            return Object.assign({}, state, {
                sortingOrder: action.sortingOrder
            });
        case Actions.SET_SEARCH_TERM:
            return Object.assign({}, state, {
                searchTerm: action.searchTerm
            });
        default:
            return state;
    }
};

export default HomeReducer;