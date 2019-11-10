export default (
  state = {
    tempo: 90.0,
    playingStartBeat: 1,
    playingStartTime: 0,
    playing: false,
    currentBeat: 1,
    volume: 1,
    sampleLoading: false,
    tracks: []
  },
  action
) => {
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
    default:
      return state
  }
}