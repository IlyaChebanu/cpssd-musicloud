const API_URL = 'https://dcumusicloud.com:5000/'

export function loginUser(username, password, deviceToken) {

    let url = `${API_URL}api/v1/auth/login`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({
            "username": username,
            "password": password,
            "did": deviceToken
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

export function logoutUser(token, deviceToken) {

    let url = `${API_URL}api/v1/auth/logout`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "did": deviceToken
        })
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

export function getUserPosts(username, token, next_page, posts_per_page) {

    let url = `${API_URL}api/v1/users/posts?username=${username}`;
    if (next_page) {
        url = url + `&next_page=${next_page}`
    }
    if (posts_per_page) {
        url = url + `&posts_per_page=${posts_per_page}`
    }
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

export function followUser(token, username) {

    let url = `${API_URL}api/v1/users/follow`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "username": username
        })
    });
    if (__DEV__) {
        console.log("followUser : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("followUser : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("followUser : error " + JSON.stringify(error))
            }
            return error
        });
}

export function unfollowUser(token, username) {

    let url = `${API_URL}api/v1/users/unfollow`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "username": username
        })
    });
    if (__DEV__) {
        console.log("unfollowUser : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("unfollowUser : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("unfollowUser : error " + JSON.stringify(error))
            }
            return error
        });
}

export function getFollowers(username, token, users_per_page, next_page) {

    let url = `${API_URL}api/v1/users/followers?username=${username}`;
    if (users_per_page) {
        url = url + `&users_per_page=${users_per_page}`
        if (next_page) {
            url = url + `&next_page=${next_page}`
        }
    }
    var request = new Request(url, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
    });
    if (__DEV__) {
        console.log("getFollowers : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("getFollowers : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("getFollowers : error " + JSON.stringify(error))
            }
            return error
        });
}

export function getFollowing(username, token, users_per_page, next_page) {

    let url = `${API_URL}api/v1/users/following?username=${username}`;
    if (users_per_page) {
        url = url + `&users_per_page=${users_per_page}`
        if (next_page) {
            url = url + `&next_page=${next_page}`
        }
    }
    var request = new Request(url, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
    });
    if (__DEV__) {
        console.log("getFollowing : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("getFollowing : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("getFollowing : error " + JSON.stringify(error))
            }
            return error
        });
}

export function getUserTimeline(token, posts_only, songs_only, next_page, items_per_page) {

    let url = `${API_URL}api/v1/users/timeline`;
    if (posts_only) {
        url = url + `?posts_only=${posts_only}`
        if (next_page) {
            url = url + `&next_page=${next_page}`
        }
        if (items_per_page) {
            url = url + `&items_per_page=${items_per_page}`
        }
    } else if (songs_only) {
        url = url + `?songs_only=${songs_only}`
        if (next_page) {
            url = url + `&next_page=${next_page}`
        }
        if (items_per_page) {
            url = url + `&items_per_page=${items_per_page}`
        }
    }
    var request = new Request(url, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
    });
    if (__DEV__) {
        console.log("getUserTimeline : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("getUserTimeline : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("getUserTimeline : error " + JSON.stringify(error))
            }
            return error
        });
}

export function patchNotifications(token, status) {

    let url = `${API_URL}api/v1/users/notifications`;
    var request = new Request(url, {
        method: "PATCH",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "status": status
        })
    });
    if (__DEV__) {
        console.log("patchNotifications : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("patchNotifications : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("patchNotifications : error " + JSON.stringify(error))
            }
            return error
        });
}

export function patchNotificationsFollow(token, status) {

    let url = `${API_URL}api/v1/users/notifications/follows`;
    var request = new Request(url, {
        method: "PATCH",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "status": status
        })
    });
    if (__DEV__) {
        console.log("patchNotificationsFollow : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("patchNotificationsFollow : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("patchNotificationsFollow : error " + JSON.stringify(error))
            }
            return error
        });
}

export function patchNotificationsPost(token, status) {

    let url = `${API_URL}api/v1/users/notifications/posts`;
    var request = new Request(url, {
        method: "PATCH",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "status": status
        })
    });
    if (__DEV__) {
        console.log("patchNotificationsPost : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("patchNotificationsPost : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("patchNotificationsPost : error " + JSON.stringify(error))
            }
            return error
        });
}

export function patchNotificationsSong(token, status) {

    let url = `${API_URL}api/v1/users/notifications/songs`;
    var request = new Request(url, {
        method: "PATCH",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "status": status
        })
    });
    if (__DEV__) {
        console.log("patchNotificationsSong : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("patchNotificationsSong : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("patchNotificationsSong : error " + JSON.stringify(error))
            }
            return error
        });
}

export function patchNotificationsLike(token, status) {

    let url = `${API_URL}api/v1/users/notifications/likes`;
    var request = new Request(url, {
        method: "PATCH",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "status": status
        })
    });
    if (__DEV__) {
        console.log("patchNotificationsLike : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("patchNotificationsLike : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("patchNotificationsLike : error " + JSON.stringify(error))
            }
            return error
        });
}
