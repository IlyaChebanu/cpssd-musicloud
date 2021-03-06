/* eslint-disable no-param-reassign */

import _ from 'lodash';
import undoable, { includeAction, groupByActionTypes } from 'redux-undo';

export const undoableStateReducer = undoable((
  state = {
    tracks: [],
    samples: {},
  },
  action,
) => {
  switch (action.type) {
    case 'SET_COMPLETE_TRACKS_STATE':
      return {
        ...state,
        tracks: action.tracks,
      };
    case 'SET_COMPLETE_SAMPLES_STATE':
      return {
        ...state,
        samples: action.samples,
      };
    case 'SET_TRACK': {
      const tracks = [...state.tracks];
      tracks[action.index] = { ...action.track };
      return {
        ...state,
        tracks,
      };
    }
    case 'DELETE_TRACK': {
      let tracks = [...state.tracks];
      tracks = tracks.filter((track) => track !== tracks[action.index]);
      return {
        ...state,
        tracks,
      };
    }
    case 'SET_SAMPLE_FADE':
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          track.samples = track.samples.map((sample) => {
            if (sample.id === action.id) {
              return {
                ...sample,
                fade: action.fade,
              };
            }
            return sample;
          });
          return track;
        }),
      };
    case 'SET_SAMPLE_REVERB':
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          track.samples = track.samples.map((sample) => {
            if (sample.id === action.id) {
              return {
                ...sample,
                reverb: action.reverb,
              };
            }
            return sample;
          });
          return track;
        }),
      };
    case 'ADD_TRACK':
      return {
        ...state,
        tracks: [...state.tracks, action.track],
      };
    case 'REMOVE_TRACK':
      return {
        ...state,
        tracks: state.tracks.filter((t) => t.id !== action.trackId),
      };
    case 'SET_TRACK_VOLUME':
      return {
        ...state,
        tracks: state.tracks.map((t) => (
          t.id === action.trackId ? { ...t, volume: action.value } : t
        )),
      };
    case 'SET_TRACK_PAN':
      return {
        ...state,
        tracks: state.tracks.map((t) => (
          t.id === action.trackId ? { ...t, pan: action.value } : t
        )),
      };
    case 'SET_TRACK_MUTE':
      return {
        ...state,
        tracks: state.tracks.map((t) => (
          t.id === action.trackId ? { ...t, mute: t.solo ? t.mute : action.value } : t
        )),
      };
    case 'SET_TRACK_SOLO':
      return {
        ...state,
        tracks: state.tracks.map((t) => {
          if (t.id === action.trackId) {
            return { ...t, solo: action.value };
          }
          return t.solo ? { ...t, solo: false } : t;
        }),
      };
    case 'SET_TRACK_NAME':
      return {
        ...state,
        tracks: state.tracks.map((t) => (
          t.id === action.trackId ? { ...t, name: action.value } : t
        )),
      };
    case 'SET_TRACK_REVERB':
      return {
        ...state,
        tracks: state.tracks.map((t) => (
          t.id === action.trackId ? { ...t, reverb: action.value } : t
        )),
      };
    case 'ADD_SAMPLE':
      return {
        ...state,
        samples: { ...state.samples, [action.sampleId]: action.sample },
      };
    case 'REMOVE_SAMPLE':
      return {
        ...state,
        samples: _.omit(state.samples, action.sampleId),
      };
    case 'SET_SAMPLE_BUFFER_LOADING': {
      const samples = { ...state.samples };
      samples[action.sampleId] = { ...samples[action.sampleId], bufferLoading: action.value };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_SAMPLE_TRACK_ID': {
      const samples = { ...state.samples };
      samples[action.sampleId] = { ...samples[action.sampleId], trackId: action.value };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_SAMPLE_START_TIME': {
      const samples = { ...state.samples };
      samples[action.sampleId] = { ...samples[action.sampleId], time: action.value };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_SAMPLE_FADE_IN': {
      const samples = { ...state.samples };
      samples[action.sampleId] = {
        ...samples[action.sampleId],
        fade: { ...samples[action.sampleId].fade, fadeIn: action.value },
      };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_SAMPLE_FADE_OUT': {
      const samples = { ...state.samples };
      samples[action.sampleId] = {
        ...samples[action.sampleId],
        fade: { ...samples[action.sampleId].fade, fadeOut: action.value },
      };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_SAMPLE_NAME': {
      const samples = { ...state.samples };
      samples[action.sampleId] = { ...samples[action.sampleId], name: action.value };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_SAMPLE_TYPE': {
      const samples = { ...state.samples };
      samples[action.sampleId] = { ...samples[action.sampleId], type: action.value };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_SAMPLE_DURATION': {
      const samples = { ...state.samples };
      samples[action.sampleId] = { ...samples[action.sampleId], duration: action.value };
      return {
        ...state,
        samples,
      };
    }
    case 'ADD_PATTERN_NOTE': {
      const samples = { ...state.samples };
      samples[action.sampleId] = {
        ...samples[action.sampleId],
        notes: { ...samples[action.sampleId].notes, [action.noteId]: action.note },
      };
      return {
        ...state,
        samples,
      };
    }
    case 'REMOVE_PATTERN_NOTE': {
      const samples = { ...state.samples };
      samples[action.sampleId] = {
        ...samples[action.sampleId],
        notes: _.omit(samples[action.sampleId].notes, action.noteId),
      };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_PATTERN_NOTE_TICK': {
      const samples = { ...state.samples };
      const { notes } = samples[action.sampleId];
      samples[action.sampleId] = {
        ...samples[action.sampleId],
        notes: {
          ...notes,
          [action.noteId]: { ...notes[action.noteId], tick: action.value },
        },
      };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_PATTERN_NOTE_NUMBER': {
      const samples = { ...state.samples };
      const { notes } = samples[action.sampleId];
      samples[action.sampleId] = {
        ...samples[action.sampleId],
        notes: {
          ...notes,
          [action.noteId]: { ...notes[action.noteId], noteNumber: action.value },
        },
      };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_PATTERN_NOTE_VELOCITY': {
      const samples = { ...state.samples };
      const { notes } = samples[action.sampleId];
      samples[action.sampleId] = {
        ...samples[action.sampleId],
        notes: {
          ...notes,
          [action.noteId]: { ...notes[action.noteId], velocity: action.value },
        },
      };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_PATTERN_NOTE_DURATION': {
      const samples = { ...state.samples };
      const { notes } = samples[action.sampleId];
      samples[action.sampleId] = {
        ...samples[action.sampleId],
        notes: {
          ...notes,
          [action.noteId]: { ...notes[action.noteId], duration: action.value },
        },
      };
      return {
        ...state,
        samples,
      };
    }
    case 'SET_SAMPLE_PATCH': {
      return {
        ...state,
        samples: {
          ...state.samples,
          [action.sampleId]: {
            ...state.samples[action.sampleId],
            patch: action.patchData,
          },
        },
      };
    }
    case 'SET_SAMPLE_PATCH_ID': {
      return {
        ...state,
        samples: {
          ...state.samples,
          [action.sampleId]: {
            ...state.samples[action.sampleId],
            patchId: action.patchId,
          },
        },
      };
    }
    case 'SET_TRACK_EFFECTS': {
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          if (track.id === action.trackId) {
            return {
              ...track,
              effects: action.effects,
            };
          }
          return track;
        }),
      };
    }
    default:
      return state;
  }
}, {
  filter: includeAction([
    'SET_COMPLETE_TRACKS_STATE',
    'SET_COMPLETE_SAMPLES_STATE',
    'SET_TRACK',
    'ADD_TRACK',
    'REMOVE_TRACK',
    'ADD_SAMPLE',
    'REMOVE_SAMPLE',
    'SET_SAMPLE_TRACK_ID',
    'SET_SAMPLE_START_TIME',
    'SET_SAMPLE_TYPE',
    'ADD_PATTERN_NOTE',
    'REMOVE_PATTERN_NOTE',
    'SET_PATTERN_NOTE_TICK',
    'SET_PATTERN_NOTE_NUMBER',
    'SET_PATTERN_NOTE_VELOCITY',
    'SET_PATTERN_NOTE_DURATION',
    'SET_SAMPLE_PATCH',
    'SET_SAMPLE_FADE_IN',
    'SET_SAMPLE_FADE_OUT',
  ]),
  groupBy: groupByActionTypes([
    'SET_SAMPLE_PATCH',
    'SET_SAMPLE_FADE_IN',
    'SET_SAMPLE_FADE_OUT',
  ]),
});

export default (
  state = {
    ppq: 1,
    loop: {
      start: 1,
      stop: 17,
    },
    fileMoved: 0,
    folderMoved: 0,
    selectedFile: {},
    selectedFolder: {},
    songName: 'New Song',
    songDescription: '',
    gridSize: 1,
    gridWidth: 1,
    minGridUnitWidth: 40,
    gridUnitWidth: 40,
    maxGridUnitWidth: 80,
    gridSnapEnabled: true,
    loopEnabled: true,
    scroll: 0,
    scrollY: 0,
    tempo: 140.0,
    playingStartBeat: 1,
    playingStartTime: 0,
    playing: false,
    currentBeat: 1,
    volume: 1,
    sampleLoading: false,
    channels: [],
    selectedTrack: 0,
    selectedSample: '',
    multipleSelectedSamples: [],
    clipboard: [],
    title: 'Untitled',
    songPickerHidden: false,
    fileExplorerHidden: true,
    sampleEffectsHidden: true,
    publishFormHidden: true,
    songImageUrl: null,
    showPianoRoll: false,
    recording: false,
    draggingSeekBar: false,
    samplesLoading: false,
    showEffectsWindow: false,
  },
  action,
) => {
  switch (action.type) {
    case 'SET_SAMPLES_LOADING':
      return {
        ...state,
        samplesLoading: action.payload,
      };
    case 'SHOW_EFFECTS_WINDOW':
      return {
        ...state,
        showEffectsWindow: true,
      };
    case 'HIDE_EFFECTS_WINDOW':
      return {
        ...state,
        showEffectsWindow: false,
      };
    case 'ADD_TO_SAMPLE_SELECTION':
      return {
        ...state,
        multipleSelectedSamples: [...state.multipleSelectedSamples, action.payload],
      };
    case 'REMOVE_FROM_SAMPLE_SELECTION':
      return {
        ...state,
        multipleSelectedSamples: state.multipleSelectedSamples.filter((s) => s !== action.payload),
      };
    case 'RESET_SAMPLE_SELECTION':
      return {
        ...state,
        multipleSelectedSamples: [],
      };
    case 'RECORDING_START':
      return {
        ...state,
        recording: true,
      };
    case 'RECORDING_STOP':
      return {
        ...state,
        recording: false,
      };
    case 'STUDIO_PLAY':
      return {
        ...state,
        playing: true,
      };
    case 'STUDIO_PAUSE':
      return {
        ...state,
        playing: false,
      };
    case 'STUDIO_STOP':
      return {
        ...state,
        playing: false,
      };
    case 'PLAYING_START_TIME':
      return {
        ...state,
        playingStartTime: action.time,
      };
    case 'PLAYING_START_BEAT':
      return {
        ...state,
        playingStartBeat: action.beat,
      };
    case 'SET_CURRENT_BEAT':
      return {
        ...state,
        currentBeat: action.beat,
      };
    case 'SET_TEMPO':
      return {
        ...state,
        tempo: action.tempo,
      };
    case 'SET_SAMPLE_LOADING':
      return {
        ...state,
        sampleLoading: action.bool,
      };
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.volume,
      };
    case 'SET_SCROLL':
      return {
        ...state,
        scroll: action.scroll,
      };
    case 'SET_SCROLL_Y':
      return {
        ...state,
        scrollY: action.scroll,
      };
    case 'SET_LOOP':
      return {
        ...state,
        loop: action.obj,
      };
    case 'SET_LOOP_ENABLED':
      return {
        ...state,
        loopEnabled: action.bool,
      };
    case 'SET_GRID_SIZE':
      return {
        ...state,
        gridSize: Math.max(1, Math.min(8, action.gridSize)),
      };
    case 'SET_GRID_WIDTH':
      return {
        ...state,
        gridWidth: action.width,
      };
    case 'SET_GRID_UNIT_WIDTH':
      return {
        ...state,
        gridUnitWidth: Math.max(
          Math.min(state.maxGridUnitWidth, action.width),
          state.minGridUnitWidth,
        ),
      };
    case 'SET_GRID_SNAP_ENABLED':
      return {
        ...state,
        gridSnapEnabled: action.bool,
      };
    case 'SET_SELECTED_TRACK':
      return {
        ...state,
        selectedTrack: action.track,
      };
    case 'SET_SELECTED_SAMPLE':
      return {
        ...state,
        selectedSample: action.id,
      };
    case 'SET_CLIPBOARD':
      return {
        ...state,
        clipboard: action.sample,
      };
    case 'SET_SONG_TITLE':
      return {
        ...state,
        title: action.title,
      };
    case 'SET_DRAGGING_SEEKBAR':
      return {
        ...state,
        draggingSeekBar: action.draggingSeekBar,
      };
    case 'SONG_PICKER_HIDE':
      return {
        ...state,
        songPickerHidden: true,
      };
    case 'SONG_PICKER_SHOW':
      return {
        ...state,
        songPickerHidden: false,
      };
    case 'SAMPLE_EFFECTS_HIDE':
      return {
        ...state,
        sampleEffectsHidden: true,
      };
    case 'SAMPLE_EFFECTS_SHOW':
      return {
        ...state,
        sampleEffectsHidden: false,
      };
    case 'PUBLISH_FORM_HIDE':
      return {
        ...state,
        publishFormHidden: true,
      };
    case 'PUBLISH_FORM_SHOW':
      return {
        ...state,
        publishFormHidden: false,
      };
    case 'FILE_EXPLORER_HIDE':
      return {
        ...state,
        fileExplorerHidden: true,
      };
    case 'FILE_EXPLORER_SHOW':
      return {
        ...state,
        fileExplorerHidden: false,
      };
    case 'SET_FILE_MOVED':
      return {
        ...state,
        fileMoved: action.fileMoved,
      };
    case 'SET_FOLDER_MOVED':
      return {
        ...state,
        folderMoved: action.folderMoved,
      };

    case 'SET_SELECTED_FILE':
      return {
        ...state,
        selectedFile: action.selectedFile,
      };
    case 'SET_SELECTED_FOLDER':
      return {
        ...state,
        selectedFolder: action.selectedFolder,
      };
    case 'SET_SONG_NAME':
      return {
        ...state,
        songName: action.songName,
      };
    case 'SET_SONG_DESCRIPTION':
      return {
        ...state,
        songDescription: action.description,
      };
    case 'SET_SONG_IMAGE_URL':
      return {
        ...state,
        songImageUrl: action.songImageUrl,
      };
    case 'SET_SHOW_PIANO_ROLL':
      return {
        ...state,
        showPianoRoll: action.bool,
      };
    default:
      return state;
  }
};
