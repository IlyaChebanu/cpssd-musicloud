import * as actionsTypes from './actionTypes';

export function setNewAccount(newAccount) {
    return {
        type: actionsTypes.SET_NEW_ACCOUNT,
        newAccount
    }
}

export function setEmail(email) {
    return {
        type: actionsTypes.SET_EMAIL,
        email
    }
}

