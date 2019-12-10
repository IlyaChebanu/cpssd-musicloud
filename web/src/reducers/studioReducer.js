/* eslint-disable no-param-reassign */
export default (
  state = {
    loop: {
      start: 1,
      stop: 17,
    },
    songId: null,
    songName: 'New Song',
    songDescription: '',
    gridSize: 1,
    gridWidth: 1,
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
    tracks: [],
    selectedTrack: 0,
    selectedSample: -1,
    clipboard: {},
    title: 'Untitled',
    songPickerHidden: false,
    sampleEffectsHidden: true,
    publishFormHidden: true,
    songImageUrl: null,
  },
  action,
) => {
  let tracks;
  switch (action.type) {
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
    case 'SET_TRACKS':
      return {
        ...state,
        tracks: action.tracks,
      };
    case 'SET_TRACK':
      tracks = [...state.tracks];
      tracks[action.index] = action.track;
      return {
        ...state,
        tracks,
      };
    case 'SET_SAMPLE_TIME':
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          track.samples = track.samples.map((sample) => {
            if (sample.id === action.id) {
              return {
                ...sample,
                time: action.time,
              };
            }
            return sample;
          });
          return track;
        }),
      };
    case 'SET_SAMPLE_NAME':
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          track.samples = track.samples.map((sample) => {
            if (sample.id === action.id) {
              return {
                ...sample,
                name: action.name,
              };
            }
            return sample;
          });
          return track;
        }),
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
        gridSize: action.gridSize,
      };
    case 'SET_GRID_WIDTH':
      return {
        ...state,
        gridWidth: action.width,
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
    case 'SET_SONG_ID':
      return {
        ...state,
        songId: action.songId,
      };
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
    case 'SET_SAMPLE_DELAY':
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          track.samples = track.samples.map((sample) => {
            if (sample.id === action.id) {
              return {
                ...sample,
                delay: action.delay,
              };
            }
            return sample;
          });
          return track;
        }),
      };
    case 'SET_SONG_IMAGE_URL':
      return {
        ...state,
        songImageUrl: action.songImageUrl,
      };
    default:
      return state;
  }
};
