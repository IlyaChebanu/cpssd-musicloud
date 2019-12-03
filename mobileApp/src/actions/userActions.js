import * as actionsTypes from './actionTypes';

export function setPicUrl(picUrl) {
    return {
        type: actionsTypes.SET_PIC_URL,
        picUrl
    }
}

export function setUserData(userData) {
    return {
        type: actionsTypes.SET_USER_DATA,
        userData
    }
}

export function setOtherUserData(otherUserData) {
    return {
        type: actionsTypes.SET_OTHER_USER_DATA,
        otherUserData
    }
}

export function setFollowing(following) {
    return {
        type: actionsTypes.SET_FOLLOWING,
        following
    }
}

export function setIsPortrait(isPortrait) {
    return {
        type: actionsTypes.SET_IS_PORTRAIT,
        isPortrait
    }
}

