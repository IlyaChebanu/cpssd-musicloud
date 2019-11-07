import { playingStartTime, setCurrentBeat, playingStartBeat } from '../actions/studioActions';

const LOOKAHEAD = 25; //ms
const OVERLAP = 100/*ms*/ / 1000;

export default store => {

  let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  let beatStateUpdate;

  // Update currentBeat in redux to animate seek bar
  const beatUpdate = () => {
    const state = store.getState().studio;
    if (state.playing) {
      beatStateUpdate = requestAnimationFrame(beatUpdate);
      const secondsPerBeat = 60 / state.tempo;
      const currentBeat = state.playingStartBeat + (audioCtx.currentTime - state.playingStartTime) / secondsPerBeat;
      store.dispatch(setCurrentBeat(currentBeat));
    }
  }

  const scheduledSamples = new Set();

  let scheduler = setInterval(() => {
    const state = store.getState().studio;
    if (state.playing) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const secondsPerBeat = 60 / state.tempo;

      const currentBeat = state.currentBeat;

      // Delete played samples
      scheduledSamples.forEach(sample => {
        if (currentBeat > sample.time) {
          scheduledSamples.delete(sample);
        }
      });

      const schedulableSamples = [];
      state.tracks.forEach(track => {
        schedulableSamples.push(...track.samples.filter(sample => {
          return sample.time >= currentBeat && (sample.time - currentBeat) * secondsPerBeat < OVERLAP;
        }));
      });

      schedulableSamples.forEach(sample => {
        if (!scheduledSamples.has(sample)) {
          const startTime = audioCtx.currentTime + (sample.time - currentBeat) * secondsPerBeat;
          const endTime = audioCtx.currentTime + sample.duration + (sample.time - currentBeat) * secondsPerBeat;
          console.log('Scheduling sample', sample, 'at', audioCtx.currentTime, 'for', startTime, 'ending at', endTime);
          const osc = audioCtx.createOscillator();
          osc.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(endTime);
        }
        scheduledSamples.add(sample);
      });
    }
  }, LOOKAHEAD);

  return next => action => {
    let state;
    switch (action.type) {
      case 'STUDIO_PLAY':
        store.dispatch(playingStartTime(audioCtx.currentTime));
        requestAnimationFrame(beatUpdate);
        state = store.getState().studio;
        const secondsPerBeat = 60 / state.tempo;
        const currentBeat = state.currentBeat;
        const schedulableSamples = [];
        state.tracks.forEach(track => {
          schedulableSamples.push(...track.samples.filter(sample => {
            const startTime = audioCtx.currentTime + (sample.time - currentBeat) * secondsPerBeat;
            const endTime = audioCtx.currentTime + sample.duration + (sample.time - currentBeat) * secondsPerBeat;
            return endTime > audioCtx.currentTime && startTime <= audioCtx.currentTime;
          }));
        });

        schedulableSamples.forEach(sample => {
          if (!scheduledSamples.has(sample)) {
            const startTime = audioCtx.currentTime + (sample.time - currentBeat) * secondsPerBeat;
            const endTime = audioCtx.currentTime + sample.duration + (sample.time - currentBeat) * secondsPerBeat;
            console.log('Scheduling old sample', sample, 'at', audioCtx.currentTime, 'for', startTime, 'ending at', endTime);
            const osc = audioCtx.createOscillator();
            osc.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(endTime);
          }
          scheduledSamples.add(sample);
        });
      case 'STUDIO_PAUSE':
        state = store.getState().studio;
        store.dispatch(playingStartBeat(state.currentBeat));
      case 'STUDIO_STOP':
        store.dispatch(playingStartBeat(1));
        store.dispatch(setCurrentBeat(1));
      default:
        break;
      };
    return next(action);
  };
};
