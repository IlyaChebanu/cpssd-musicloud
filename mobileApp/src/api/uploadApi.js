var Buffer = require('buffer/').Buffer;

const API_URL = 'http://dcumusicloud.com:5000/'
const S3_URL = 'https://dcumusicloudbucket.s3.amazonaws.com/'

export function postFile(token, dir, fileName, fileType) {

    let url = `${API_URL}api/v1/s3/signed-form-post`;
    var request = new Request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + token,
        }),
        body: JSON.stringify({
            "dir": dir,
            "fileName": fileName,
            "fileType": fileType
        })
    });
    if (__DEV__) {
        console.log("postFile : request " + JSON.stringify(request))
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
                console.log("postFile : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("postFile : error " + JSON.stringify(error))
            }
            return error
        });
}

export function putUploadFile(urlKey, file, fileType) {

    let url = `${S3_URL}${urlKey}`;
    const buffer = Buffer.from(file, 'base64')
    var request = new Request(url, {
        method: "PUT",
        headers: new Headers({
            "Content-Type": fileType,
        }),
        body: buffer
    });
    if (__DEV__) {
        console.log("putUploadFile : request " + JSON.stringify(request))
    }

    return fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.status
            } else {
                return response.status
            }
        })
        .then(responseJson => {
            if (__DEV__) {
                console.log("putUploadFile : response " + JSON.stringify(responseJson))
            }
            return responseJson;
        })
        .catch(error => {
            if (__DEV__) {
                console.log("putUploadFile : error " + JSON.stringify(error))
            }
            return error
        });
}