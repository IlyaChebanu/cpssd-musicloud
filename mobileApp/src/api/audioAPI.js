const API_URL = 'http://dcumusicloud.com:5000/'

export function getCompiledSongs(token, username, songs_per_page) {

    let url = `${API_URL}api/v1/audio/compiled_songs`;
    if (songs_per_page) {
        url = url + `?songs_per_page=${songs_per_page}`
        if (username) {
            url = url + `&username=${username}`
        }
    } else if (username) {
        url = url + `?username=${username}`
    }
    var request = new Request(url, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
    });
    if (__DEV__) {
        console.log("getCompiledSongs : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("getCompiledSongs : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("getCompiledSongs : error " + JSON.stringify(error))
            }
            return error
        });
}

export function getLikedSongs(token, username, songs_per_page) {

    let url = `${API_URL}api/v1/audio/liked_songs`;
    if (songs_per_page) {
        url = url + `?songs_per_page=${songs_per_page}`
        if (username) {
            url = url + `&username=${username}`
        }
    } else if (username) {
        url = url + `?username=${username}`
    }
    var request = new Request(url, {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
    });
    if (__DEV__) {
        console.log("getLikedSongs : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("getLikedSongs : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("getLikedSongs : error " + JSON.stringify(error))
            }
            return error
        });
}

export function postLikeSong(token, sid) {

    let url = `${API_URL}api/v1/audio/like`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "sid": sid
        })
    });
    if (__DEV__) {
        console.log("postLikeSong : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("postLikeSong : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("postLikeSong : error " + JSON.stringify(error))
            }
            return error
        });
}

export function postUnlikeSong(token, sid) {

    let url = `${API_URL}api/v1/audio/unlike`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "sid": sid
        })
    });
    if (__DEV__) {
        console.log("postLikeSong : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("postLikeSong : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("postLikeSong : error " + JSON.stringify(error))
            }
            return error
        });
}
