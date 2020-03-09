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

export function setIsNotification(isNotification) {
    return {
        type: actionsTypes.SET_IS_NOTIFICATION,
        isNotification
    }
}

export function setIsNotificationFollow(isNotificationFollow) {
    return {
        type: actionsTypes.SET_IS_NOTIFICATION_FOLLOW,
        isNotificationFollow
    }
}

export function setIsNotificationPost(isNotificationPost) {
    return {
        type: actionsTypes.SET_IS_NOTIFICATION_POST,
        isNotificationPost
    }
}

export function setIsNotificationSong(isNotificationSong) {
    return {
        type: actionsTypes.SET_IS_NOTIFICATION_SONG,
        isNotificationSong
    }
}

export function setIsNotificationLike(isNotificationLike) {
    return {
        type: actionsTypes.SET_IS_NOTIFICATION_LIKE,
        isNotificationLike
    }
}
