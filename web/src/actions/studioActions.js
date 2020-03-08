import { genId } from '../helpers/utils';

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

export const deleteTrackAtIndex = (index) => (dispatch) => {
  dispatch({
    type: 'DELETE_TRACK',
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

export const hideSampleEffects = () => (dispatch) => {
  dispatch({
    type: 'SAMPLE_EFFECTS_HIDE',
  });
};

export const showSampleEffects = () => (dispatch) => {
  dispatch({
    type: 'SAMPLE_EFFECTS_SHOW',
  });
};

export const hidePublishForm = () => (dispatch) => {
  dispatch({
    type: 'PUBLISH_FORM_HIDE',
  });
};

export const showPublishForm = () => (dispatch) => {
  dispatch({
    type: 'PUBLISH_FORM_SHOW',
  });
};

export const hideFileExplorer = () => (dispatch) => {
  dispatch({
    type: 'FILE_EXPLORER_HIDE',
  });
};

export const showFileExplorer = () => (dispatch) => {
  dispatch({
    type: 'FILE_EXPLORER_SHOW',
  });
};

export const setSongName = (songName) => (dispatch) => {
  dispatch({
    type: 'SET_SONG_NAME',
    songName,
  });
};

export const setSongDescription = (description) => (dispatch) => {
  dispatch({
    type: 'SET_SONG_DESCRIPTION',
    description,
  });
};

export const setSampleFade = (id, fade) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_FADE',
    id,
    fade,
  });
};

export const setSampleReverb = (id, reverb) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_REVERB',
    id,
    reverb,
  });
};

export const setSongImageUrl = (songImageUrl) => (dispatch) => {
  dispatch({
    type: 'SET_SONG_IMAGE_URL',
    songImageUrl,
  });
};

export const setShowPianoRoll = (bool) => (dispatch) => {
  dispatch({
    type: 'SET_SHOW_PIANO_ROLL',
    bool,
  });
};

export const setCompleteTracksState = (tracks) => (dispatch) => {
  dispatch({
    type: 'SET_COMPLETE_TRACKS_STATE',
    tracks,
  });
};

export const setCompleteSamplesState = (samples) => (dispatch) => {
  dispatch({
    type: 'SET_COMPLETE_SAMPLES_STATE',
    samples,
  });
};

export const addTrack = (track = {
  id: genId(),
  mute: false,
  solo: false,
  volume: 0.75,
  pan: 0,
  name: 'New Track',
}) => (dispatch) => {
  dispatch({
    type: 'ADD_TRACK',
    track,
  });
};

export const removeTrack = (trackId) => (dispatch) => {
  dispatch({
    type: 'REMOVE_TRACK',
    trackId,
  });
};

export const setTrackVolume = (trackId, value) => (dispatch) => {
  dispatch({
    type: 'SET_TRACK_VOLUME',
    trackId,
    value: Math.min(1, Math.max(0, value)),
  });
};

export const setTrackPan = (trackId, value) => (dispatch) => {
  dispatch({
    type: 'SET_TRACK_PAN',
    trackId,
    value,
  });
};

export const setTrackMute = (trackId, value) => (dispatch) => {
  dispatch({
    type: 'SET_TRACK_MUTE',
    trackId,
    value,
  });
};

export const setTrackSolo = (trackId, value) => (dispatch) => {
  dispatch({
    type: 'SET_TRACK_SOLO',
    trackId,
    value,
  });
};

export const setTrackName = (trackId, value) => (dispatch) => {
  dispatch({
    type: 'SET_TRACK_NAME',
    trackId,
    value,
  });
};

export const addSample = (trackId, sample) => (dispatch) => {
  dispatch({
    type: 'ADD_SAMPLE',
    sampleId: genId(),
    sample: {
      type: 'sample', notes: {}, trackId, ...sample,
    },
  });
};

export const removeSample = (sampleId) => (dispatch) => {
  dispatch({
    type: 'REMOVE_SAMPLE',
    sampleId,
  });
};

export const setSampleBufferLoading = (sampleId, value) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_BUFFER_LOADING',
    sampleId,
    value,
  });
};

export const setSampleTrackId = (sampleId, value) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_TRACK_ID',
    sampleId,
    value,
  });
};

export const setSampleStartTime = (sampleId, value) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_START_TIME',
    sampleId,
    value: Math.max(1, value),
  });
};

export const setSampleFadeIn = (sampleId, value) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_FADE_IN',
    sampleId,
    value: Math.min(1, Math.max(0, value)),
  });
};

export const setSampleFadeOut = (sampleId, value) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_FADE_OUT',
    sampleId,
    value: Math.min(1, Math.max(0, value)),
  });
};

export const setSampleName = (sampleId, value) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_NAME',
    sampleId,
    value,
  });
};

export const setSampleType = (sampleId, value) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_TYPE',
    sampleId,
    value,
  });
};

export const setSampleDuration = (sampleId, value) => (dispatch) => {
  dispatch({
    type: 'SET_SAMPLE_DURATION',
    sampleId,
    value: Math.max(0, value),
  });
};

export const addPatternNote = (sampleId, note) => (dispatch) => {
  dispatch({
    type: 'ADD_PATTERN_NOTE',
    sampleId,
    noteId: genId(),
    note,
  });
};

export const removePatternNote = (sampleId, noteId) => (dispatch) => {
  dispatch({
    type: 'REMOVE_PATTERN_NOTE',
    noteId,
    sampleId,
  });
};

export const setPatternNoteTick = (sampleId, noteId, value) => (dispatch) => {
  dispatch({
    type: 'SET_PATTERN_NOTE_TICK',
    noteId,
    sampleId,
    value: Math.max(0, value),
  });
};

export const setPatternNoteNumber = (sampleId, noteId, value) => (dispatch) => {
  dispatch({
    type: 'SET_PATTERN_NOTE_NUMBER',
    noteId,
    sampleId,
    value: Math.min(88, Math.max(0, value)),
  });
};

export const setPatternNoteVelocity = (sampleId, noteId, value) => (dispatch) => {
  dispatch({
    type: 'SET_PATTERN_NOTE_VELOCITY',
    noteId,
    sampleId,
    value: Math.min(127, Math.max(0, value)),
  });
};

export const setPatternNoteDuration = (sampleId, noteId, value) => (dispatch) => {
  dispatch({
    type: 'SET_PATTERN_NOTE_DURATION',
    noteId,
    sampleId,
    value: Math.max(0, value),
  });
};
