import * as actionsTypes from "../actions/actionTypes";

// Song Actions
export function setSongId(songId) {
    return {
        type: actionsTypes.SET_SONG_ID,
        songId
    }
}

export function setSongIndex(songIndex) {
    return {
        type: actionsTypes.SET_SONG_INDEX,
        songIndex
    }
}

export function setSongUrl(songUrl) {
    return {
        type: actionsTypes.SET_SONG_URL,
        songUrl
    }
}

export function setSongUpdate(songUpdate) {
    return {
        type: actionsTypes.SET_SONG_UPDATE,
        songUpdate
    }
}

export function setSongData(songData) {
    return {
        type: actionsTypes.SET_SONG_DATA,
        songData
    }
}