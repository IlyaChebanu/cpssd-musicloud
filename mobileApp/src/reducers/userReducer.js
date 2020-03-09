import * as Actions from '../actions/actionTypes'

let initialState = { picUrl: '', userData: {}, otherUserData: {}, viewingProfile: false, following: {}, isPortrait: true, isNotification: true, isNotificationFollow: true, isNotificationPost: true, isNotificationSong: true, isNotificationLike: true };

const UserReducer = (state = initialState, action) => {

    switch (action.type) {
        case Actions.SET_PIC_URL:
            return Object.assign({}, state, {
                picUrl: action.picUrl
            });
        case Actions.SET_USER_DATA:
            return Object.assign({}, state, {
                userData: action.userData
            });
        case Actions.SET_OTHER_USER_DATA:
            return Object.assign({}, state, {
                otherUserData: action.otherUserData
            });
        case Actions.SET_FOLLOWING:
            return Object.assign({}, state, {
                following: action.following
            });
        case Actions.SET_IS_PORTRAIT:
            return Object.assign({}, state, {
                isPortrait: action.isPortrait
            });
        case Actions.SET_IS_NOTIFICATION:
            return Object.assign({}, state, {
                isNotification: action.isNotification
            });
        case Actions.SET_IS_NOTIFICATION_FOLLOW:
            return Object.assign({}, state, {
                isNotificationFollow: action.isNotificationFollow
            });
        case Actions.SET_IS_NOTIFICATION_POST:
            return Object.assign({}, state, {
                isNotificationPost: action.isNotificationPost
            });
        case Actions.SET_IS_NOTIFICATION_SONG:
            return Object.assign({}, state, {
                isNotificationSong: action.isNotificationSong
            });
        case Actions.SET_IS_NOTIFICATION_LIKE:
            return Object.assign({}, state, {
                isNotificationLike: action.isNotificationLike
            });
        default:
            return state;
    }
};

export default UserReducer;