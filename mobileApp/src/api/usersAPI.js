const API_URL = 'http://dcumusicloud.com:5000/'

export function loginUser(username, password) {

    let url = `${API_URL}api/v1/auth/login`;
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

    let url = `${API_URL}api/v1/users`;
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

    let url = `${API_URL}api/v1/auth/logout`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
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

export function reVerifyEmail(email) {

    let url = `${API_URL}api/v1/users/reverify`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            "email": email,
        })
    });
    if (__DEV__) {
        console.log("reVerifyEmail : request " + JSON.stringify(request))
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
                console.log("reVerifyEmail : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("reVerifyEmail : error " + JSON.stringify(error))
            }
            return error
        });
}

export function passwordResetInitialize(email) {

    let url = `${API_URL}api/v1/users/reset?email=${email}`;
    var request = new Request(url, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
    });
    if (__DEV__) {
        console.log("passwordResetInitialize : request " + JSON.stringify(request))
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
                console.log("passwordResetInitialize : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("passwordResetInitialize : error " + JSON.stringify(error))
            }
            return error
        });
}

export function passwordResetConfirm(email, code, password) {

    let url = `${API_URL}api/v1/users/reset?email=${email}`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            "email": email,
            "code": code,
            "password": password
        })
    });
    if (__DEV__) {
        console.log("passwordResetInitiliaze : request " + JSON.stringify(request))
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
                console.log("passwordResetInitiliaze : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("passwordResetInitiliaze : error " + JSON.stringify(error))
            }
            return error
        });
}

export function getUserPosts(username, token) {

    let url = `${API_URL}api/v1/users/posts?username=${username}`;
    var request = new Request(url, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
    });
    if (__DEV__) {
        console.log("getUserPosts : request " + JSON.stringify(request))
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
                console.log("getUserPosts : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("getUserPosts : error " + JSON.stringify(error))
            }
            return error
        });
}

export function createUserPost(message, token) {

    let url = `${API_URL}api/v1/users/post`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "message": message
        })
    });
    if (__DEV__) {
        console.log("createUserPost : request " + JSON.stringify(request))
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
                console.log("createUserPost : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("createUserPost : error " + JSON.stringify(error))
            }
            return error
        });
}