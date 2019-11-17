import * as Actions from '../actions/actionTypes'

let initialState = { picUrl: '', userData: {}, };

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
        default:
            return state;
    }
};

export default UserReducer;