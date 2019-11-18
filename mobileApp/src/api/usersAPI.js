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
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
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
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
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
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
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
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
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
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
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

    let url = `${API_URL}api/v1/users/reset`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            "code": code,
            "email": email,
            "password": password
        })
    });
    if (__DEV__) {
        console.log("passwordResetConfirm : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("passwordResetConfirm : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("passwordResetConfirm : error " + JSON.stringify(error))
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
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
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
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
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

export function getUserInfo(username, token) {

    let url = `${API_URL}api/v1/users?username=${username}`;
    var request = new Request(url, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
    });
    if (__DEV__) {
        console.log("getUserInfo : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("getUserInfo : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("getUserInfo : error " + JSON.stringify(error))
            }
            return error
        });
}

export function patchUserDetails(current_password, password, email, token) {

    let url = `${API_URL}api/v1/users`;

    let bodyData = {
        "current_password": current_password,
        "email": email,
        "password": password
    }
    if(email === ""){
        delete bodyData.email;
    }
    if(password === ""){
        delete bodyData.password;
    }

    var request = new Request(url, {
        method: "PATCH",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify(bodyData)
    });
    if (__DEV__) {
        console.log("patchUserDetails : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("patchUserDetails : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("patchUserDetails : error " + JSON.stringify(error))
            }
            return error
        });
}

export function patchUserPictureUrl(token, picUrl) {

    let url = `${API_URL}api/v1/users/profiler`;
    var request = new Request(url, {
        method: "PATCH",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "url": picUrl
        })
    });
    if (__DEV__) {
        console.log("patchUserPictureUrl : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("patchUserPictureUrl : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("patchUserPictureUrl : error " + JSON.stringify(error))
            }
            return error
        });
}