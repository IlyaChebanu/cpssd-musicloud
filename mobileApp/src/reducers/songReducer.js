import * as Actions from '../actions/actionTypes'

let initialState = { songId: '', songUrl: '', };

const SongReducer = (state = initialState, action) => {

    switch (action.type) {
        case Actions.SET_SONG_ID:
            return Object.assign({}, state, {
                songId: action.songId
            });
        case Actions.SET_SONG_URL:
            return Object.assign({}, state, {
                songUrl: action.songUrl
            });
        default:
            return state;
    }
};

export default SongReducer;