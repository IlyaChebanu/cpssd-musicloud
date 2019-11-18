import GLOBALS from './globalStrings';

// A-Z 0-9 special characters
export function validateName(name) {
    const re = /^\S[a-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/i           // /^[a-z0-9]+$/i
    return re.test(String(name));
}

// at least 8 character, at least 1 uppercase, at least 1 number
export function validatePassword(password) {
    const re = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.{8,})|(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.[!@#\$%\^&])(?=.{8,})$/;
    return re.test(String(password));
}

export function getInvalidLoginDetails(username, password) {
    var invalidFields = []
    if (username < 1) {
        invalidFields.push(GLOBALS.LOGIN_USERNAME)
    }
    // if (validatePassword(password) !== true) {
    if (password.length < 1) {
        invalidFields.push(GLOBALS.LOGIN_PASSWORD)
    }
    return invalidFields
}

export function getInvalidRegisterDetails(username, email, password, passwordRepeat) {
    var invalidFields = []
    if (username < 1) {
        invalidFields.push(GLOBALS.REGISTER_USERNAME)
    }
    if (email < 1) {
        invalidFields.push(GLOBALS.REGISTER_EMAIL)
    }
    if (password < 1) {
        invalidFields.push(GLOBALS.REGISTER_PASSWORD)
    }
    if (password !== passwordRepeat) {
        invalidFields.push(GLOBALS.REGISTER_PASSWORD_NOT_MATCH)
    }
    return invalidFields
}

export function getInvalidUserSettingsDetails(oldPassword, email, password, passwordRepeat) {
    var invalidFields = []
    if (oldPassword < 1) {
        invalidFields.push(GLOBALS.SETTINGS_PASSWORD)
    }
    if ((password || email) < 1) {
        invalidFields.push(GLOBALS.SETTINGS_PASSWORD_OR_EMAIL)
    }
    if (password !== passwordRepeat) {
        invalidFields.push(GLOBALS.SETTINGS_PASSWORD_NOT_MATCH)
    }
    return invalidFields
}
