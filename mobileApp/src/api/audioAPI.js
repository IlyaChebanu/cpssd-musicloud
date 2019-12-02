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