import * as actionsTypes from "../actions/actionTypes";

// Song Actions
export function setSongId(songId) {
    return {
        type: actionsTypes.SET_SONG_ID,
        songId
    }
}

export function setSongUrl(songUrl) {
    return {
        type: actionsTypes.SET_SONG_URL,
        songUrl
    }
}

export function setSongData(songData) {
    return {
        type: actionsTypes.SET_SONG_DATA,
        songData
    }
}