export default (
  state = {
    loop: {
      start: 1,
      stop: 5
    },
    gridSize: 1,
    gridSnapEnabled: true,
    loopEnabled: true,
    scroll: 0,
    tempo: 90.0,
    playingStartBeat: 1,
    playingStartTime: 0,
    playing: false,
    currentBeat: 1,
    volume: 1,
    sampleLoading: false,
    tracks: [],
    selectedTrack: -1,
  },
  action
) => {
  let tracks;
  switch (action.type) {
    case 'STUDIO_PLAY':
      return {
        ...state,
        playing: true
      }
    case 'STUDIO_PAUSE':
      return {
        ...state,
        playing: false
      }
    case 'STUDIO_STOP':
      return {
        ...state,
        playing: false
      }
    case 'PLAYING_START_TIME':
      return {
        ...state,
        playingStartTime: action.time
      }
    case 'PLAYING_START_BEAT':
      return {
        ...state,
        playingStartBeat: action.beat
      }
    case 'SET_CURRENT_BEAT':
      return {
        ...state,
        currentBeat: action.beat
      }
    case 'SET_TEMPO':
      return {
        ...state,
        tempo: action.tempo
      }
    case 'SET_TRACKS':
      return {
        ...state,
        tracks: action.tracks
      }
    case 'SET_TRACK':
      tracks = [...state.tracks];
      tracks[action.index] = action.track;
      return {
        ...state,
        tracks
      }
    case 'SET_SAMPLE_TIME':
      tracks = [...state.tracks];
      tracks.forEach(track => {
        track.samples.forEach(sample => {
          if (sample.id === action.id) {
            sample.time = action.time;
          }
        });
      });
      return {
        ...state,
        tracks
      }
    case 'SET_SAMPLE_LOADING':
      return {
        ...state,
        sampleLoading: action.bool
      }
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.volume
      }
    case 'SET_SCROLL':
      return {
        ...state,
        scroll: action.scroll
      }
    case 'SET_LOOP':
      return {
        ...state,
        loop: action.obj
      }
    case 'SET_LOOP_ENABLED':
      return {
        ...state,
        loopEnabled: action.bool
      }
    case 'SET_GRID_SIZE':
      return {
        ...state,
        gridSize: action.gridSize
      }
    case 'SET_GRID_SNAP_ENABLED':
      return {
        ...state,
        gridSnapEnabled: action.bool
      }
    case 'SET_SELECTED_TRACK':
      return {
        ...state,
        selectedTrack: action.track
      }
    default:
      return state
  }
}