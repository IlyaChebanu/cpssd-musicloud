export default (
  state = {
    tempo: 90.0,
    playingStartBeat: 1,
    playingStartTime: 0,
    playing: false,
    currentBeat: 1,
    tracks: [
      {
        samples: [
          {
            id: 9238412, // Random, unique
            time: 1, // In beats
            duration: 0.5, // In seconds
          },
          {
            id: 7278845,
            time: 3,
            duration: 0.5,
          },
          {
            id: 35234234,
            time: 5,
            duration: 0.5,
          },
          {
            id: 7843784,
            time: 7,
            duration: 0.5,
          }
        ]
      },
      {
        samples: [
          {
            id: 9238412,
            time: 2,
            duration: 0.25,
          },
          {
            id: 7278845,
            time: 4,
            duration: 0.75,
          },
          {
            id: 35234234,
            time: 6,
            duration: 0.25,
          },
          {
            id: 7843784,
            time: 8,
            duration: 0.75,
          }
        ]
      }
    ]
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
    default:
      return state
  }
}