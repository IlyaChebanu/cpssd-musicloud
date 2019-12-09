export const play = (dispatch) => {
  dispatch({
    type: 'STUDIO_PLAY',
  });
};

export const pause = (dispatch) => {
  dispatch({
    type: 'STUDIO_PAUSE',
  });
};

export const stop = (dispatch) => {
  dispatch({
    type: 'STUDIO_STOP',
  });
};

export const playingStartTime = (time) => (dispatch) => {
  dispatch({
    type: 'PLAYING_START_TIME',
    time,
  });
};

export const playingStartBeat = (beat) => (dispatch) => {
  dispatch({
    type: 'PLAYING_START_BEAT',
    beat,
  });
};

export const setCurrentBeat = (beat) => (dispatch) => {
  dispatch({
    type: 'SET_CURRENT_BEAT',
    beat,
  });
};

export const setTempo = (tempo) => (dispatch) => {
  dispatch({
    type: 'SET_TEMPO',
    tempo,
  });
};

export const setTracks = (tracks) => (dispatch) => {
  dispatch({
    type: 'SET_TRACKS',
    tracks,
  });
};

export const setTrackAtIndex = (track, index) => (dispatch) => {
  dispatch({
    type: 'SET_TRACK',
    track,
    index,
  });
};

export const setSampleLoading = (bool) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_LOADING',
    bool,
  });
};

export const setVolume = (volume) => (dispatch) => {
  dispatch({
    type: 'SET_VOLUME',
    volume,
  });
};

export const setScroll = (scroll) => (dispatch) => {
  dispatch({
    type: 'SET_SCROLL',
    scroll,
  });
};

export const setScrollY = (scroll) => (dispatch) => {
  dispatch({
    type: 'SET_SCROLL_Y',
    scroll,
  });
};

export const setLoop = (obj) => (dispatch) => {
  dispatch({
    type: 'SET_LOOP',
    obj,
  });
};

export const setLoopEnabled = (bool) => (dispatch) => {
  dispatch({
    type: 'SET_LOOP_ENABLED',
    bool,
  });
};

export const setGridSize = (gridSize) => (dispatch) => {
  dispatch({
    type: 'SET_GRID_SIZE',
    gridSize,
  });
};

export const setGridWidth = (width) => (dispatch) => {
  dispatch({
    type: 'SET_GRID_WIDTH',
    width,
  });
};

export const setGridSnapEnabled = (bool) => (dispatch) => {
  dispatch({
    type: 'SET_GRID_SNAP_ENABLED',
    bool,
  });
};

export const setSampleTime = (time, id) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_TIME',
    time,
    id,
  });
};

export const setSelectedTrack = (track) => (dispatch) => {
  dispatch({
    type: 'SET_SELECTED_TRACK',
    track,
  });
};

export const setSelectedSample = (id) => (dispatch) => {
  dispatch({
    type: 'SET_SELECTED_SAMPLE',
    id,
  });
};

export const setClipboard = (sample) => (dispatch) => {
  dispatch({
    type: 'SET_CLIPBOARD',
    sample,
  });
};

export const setSongTitle = (title) => (dispatch) => {
  dispatch({
    type: 'SET_SONG_TITLE',
    title,
  });
};

export const hideSongPicker = () => (dispatch) => {
  dispatch({
    type: 'SONG_PICKER_HIDE',
  });
};

export const showSongPicker = () => (dispatch) => {
  dispatch({
    type: 'SONG_PICKER_SHOW',
  });
};

export const setSongName = (songName) => (dispatch) => {
  dispatch({
    type: 'SET_SONG_NAME',
    songName,
  });
};

export const setSongId = (songId) => (dispatch) => {
  dispatch({
    type: 'SET_SONG_ID',
    songId,
  });
};
