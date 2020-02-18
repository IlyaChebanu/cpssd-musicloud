import * as actionsTypes from './actionTypes';

export function setAuthToken(token) {
    return {
        type: actionsTypes.SET_AUTH_TOKEN,
        token
    }
}

export function setDeviceToken(deviceToken) {
    return {
        type: actionsTypes.SET_DEVICE_TOKEN,
        deviceToken
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

