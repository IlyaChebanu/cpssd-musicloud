const API_URL = 'https://dcumusicloud.com:5000/'

export function getCompiledSongs(token, username, songs_per_page, next_page) {

    let url = `${API_URL}api/v1/audio/compiled_songs`;
    if (songs_per_page) {
        url = url + `?songs_per_page=${songs_per_page}`
        if (username) {
            url = url + `&username=${username}`
        }
        if (next_page) {
            url = url + `&next_page=${next_page}`
        }
    } else if (username) {
        url = url + `?username=${username}`
        if (next_page) {
            url = url + `&next_page=${next_page}`
        }
    } else if (next_page) {
        url = url + `?next_page=${next_page}`
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

export function getLikedSongs(token, username, songs_per_page, next_page) {

    let url = `${API_URL}api/v1/audio/liked_songs`;
    if (songs_per_page) {
        url = url + `?songs_per_page=${songs_per_page}`
        if (username) {
            url = url + `&username=${username}`
        }
        if (next_page) {
            url = url + `&next_page=${next_page}`
        }
    } else if (username) {
        url = url + `?username=${username}`
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

export function getPlaylist(token, playlists_per_page, next_page) {

    let url = `${API_URL}api/v1/audio/playlist`;
    if (playlists_per_page) {
        url = url + `?playlists_per_page=${playlists_per_page}`
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
        console.log("getPlaylist : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("getPlaylist : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("getPlaylist : error " + JSON.stringify(error))
            }
            return error
        });
}

export function postPlaylist(token, title) {

    let url = `${API_URL}api/v1/audio/playlist`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "title": title
        })
    });
    if (__DEV__) {
        console.log("postPlaylist : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("postPlaylist : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("postPlaylist : error " + JSON.stringify(error))
            }
            return error
        });
}

export function getPlaylistSongs(token, pid, songs_per_page, next_page) {

    let url = `${API_URL}api/v1/audio/playlist_songs?pid=${pid}`;
    if (songs_per_page) {
        url = url + `&songs_per_page=${songs_per_page}`
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
        console.log("getPlaylistSongs : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("getPlaylistSongs : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("getPlaylistSongs : error " + JSON.stringify(error))
            }
            return error
        });
}

export function postPlaylistSong(token, pid, sid) {

    let url = `${API_URL}api/v1/audio/playlist_songs`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "pid": pid,
            "sid": sid
        })
    });
    if (__DEV__) {
        console.log("postPlaylistSong : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            return response.json().then(jsonResponse => {
                return {status: response.status, data: jsonResponse}
            })
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("postPlaylistSong : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("postPlaylistSong : error " + JSON.stringify(error))
            }
            return error
        });
}