const API_URL = 'http://dcumusicloud.com:5000/'

export function getCompiledSongs(token) {

    let url = `${API_URL}api/v1/audio/compiled_songs`;
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
            if (response.status === 200) {
                return response.json()
            } else {
                return response.status
            }
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