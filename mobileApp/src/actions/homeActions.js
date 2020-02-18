import * as actionsTypes from './actionTypes';

export function setAuthToken(token) {
    return {
        type: actionsTypes.SET_AUTH_TOKEN,
        token
    }
}

export function setUsername(username) {
    return {
        type: actionsTypes.SET_USERNAME,
        username
    }
}

export function clearReduxState() {
    return {
        type: actionsTypes.CLEAR_REDUX_STATE,
    }
}

export function setOnlineStatus(isOnline) {
    return {
        type: actionsTypes.SET_ONLINE_STATUS,
        isOnline
    }
}
