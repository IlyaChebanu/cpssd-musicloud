import * as actionsTypes from './actionTypes';

export function setAuthToken(token) {
    return {
        type: actionsTypes.SET_AUTH_TOKEN,
        token
    }
}

export function clearReduxState() {
    return {
        type: actionsTypes.CLEAR_REDUX_STATE,
    }
}

