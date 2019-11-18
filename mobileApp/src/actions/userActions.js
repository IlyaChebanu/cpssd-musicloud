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


