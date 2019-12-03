import * as Actions from '../actions/actionTypes'

let initialState = { picUrl: '', userData: {}, otherUserData: {}, viewingProfile: false, following: {}, isPortrait: true, };

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
        default:
            return state;
    }
};

export default UserReducer;