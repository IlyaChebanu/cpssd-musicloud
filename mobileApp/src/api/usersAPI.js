const API_URL = 'http://dcumusicloud.com:5000/api'

export function loginUser(username, password) {

    let url = `${API_URL}/v1/auth/login`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            "username": username,
            "password": password
        })
    });
    if (__DEV__) {
        console.log("loginUser : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                return response.status
            }
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("loginUser : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("loginUser : error " + JSON.stringify(error))
            }
            return error
        });
}

export function registerUser(username, email, password) {

    let url = `${API_URL}/v1/users`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            "username": username,
            "email": email,
            "password": password
        })
    });
    if (__DEV__) {
        console.log("registerUser : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                return response.status
            }
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("registerUser : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("registerUser : error " + JSON.stringify(error))
            }
            return error
        });
}

export function logoutUser(token) {

    let url = `${API_URL}/v1/auth/logout`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            "access_token": token,
        })
    });
    if (__DEV__) {
        console.log("logoutUser : request " + JSON.stringify(request))
    }

    return fetch(request)
        // .then(response => response.json())
        .then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                return response.status
            }
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("logoutUser : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("logoutUser : error " + JSON.stringify(error))
            }
            return error
        });
}