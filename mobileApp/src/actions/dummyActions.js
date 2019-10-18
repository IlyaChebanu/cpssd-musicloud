import * as actionsTypes from "../../actions/actionTypes";

// Dummy Actions
export function setName(setDummyName) {
    return {
        type: actionsTypes.SET_DUMMY_NAME,
        setDummyName
    }
}