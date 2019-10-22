import * as Actions from '../actions/actionTypes'

let initialState = { newAccount: false, email: '', };
const RegistrationReducer = (state = initialState, action) => {

    switch (action.type) {
        case Actions.SET_NEW_ACCOUNT:
            return Object.assign({}, state, {
                newAccount: action.newAccount,
            });
        case Actions.SET_EMAIL:
            return Object.assign({}, state, {
                email: action.email,
            });
        default:
            return state;
    }
};

export default RegistrationReducer;