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

export function setOnlineStatus(isOnline) {
    return {
        type: actionsTypes.SET_ONLINE_STATUS,
        isOnline
    }
}

export function setSortingType(sortingType) {
    return {
        type: actionsTypes.SET_SORTING_TYPE,
        sortingType
    }
}

export function setSortingOrder(sortingOrder) {
    return {
        type: actionsTypes.SET_SORTING_ORDER,
        sortingOrder
    }
}

export function setSearchTerm(searchTerm) {
    return {
        type: actionsTypes.SET_SEARCH_TERM,
        searchTerm
    }
}
