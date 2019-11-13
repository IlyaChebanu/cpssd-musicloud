import { playingStartTime, setCurrentBeat, playingStartBeat, setTracks, setSampleLoading } from '../actions/studioActions';
import axios from 'axios';
import scheduleSample from '../helpers/scheduleSample';
import getSampleTimes from '../helpers/getSampleTimes';
import { globalSongGain, audioContext, bufferStore } from '../helpers/constants';

const LOOKAHEAD = 25; //ms
const OVERLAP = 100/*ms*/ / 1000;

export default store => {
  const scheduledSamples = {};


  // Update currentBeat in redux to animate seek bar
  const beatUpdate = () => {
    const state = store.getState().studio;
    if (state.playing) {
      requestAnimationFrame(beatUpdate);
      const secondsPerBeat = 60 / state.tempo;
      let currentBeat = state.playingStartBeat + (audioContext.currentTime - state.playingStartTime) / secondsPerBeat;
      if (state.loopEnabled && currentBeat > state.loop.stop) {
        currentBeat = state.loop.start;
        store.dispatch(playingStartBeat(state.loop.start));
        store.dispatch(playingStartTime(audioContext.currentTime));
      }
      store.dispatch(setCurrentBeat(currentBeat));
    }
  }

  let scheduler = setInterval(() => {
    const state = store.getState().studio;
    if (state.playing) {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Delete played samples
      Object.entries(scheduledSamples).forEach(([id, sample]) => {
        if (sample.endTime < audioContext.currentTime) {
          delete scheduledSamples[id];
        }
      });

      // Find schedulable samples
      const schedulableSamples = [];
      state.tracks.forEach((track, i) => {
        schedulableSamples.push(...track.samples.filter(sample => {
          const [startTime, endTime] = getSampleTimes(audioContext, state, sample);
          sample.volume = track.volume;
          sample.track = i;
          sample.buffer = bufferStore[sample.url];
          sample.endTime = endTime;
          return startTime >= audioContext.currentTime && startTime < startTime + OVERLAP;
        }));
      });

      // Schedule samples
      schedulableSamples.forEach(sample => {
        if (!(sample.id in scheduledSamples)) {
          console.log('scheduling', sample);
          const source = scheduleSample(sample);
          scheduledSamples[sample.id] = { ...sample, ...source };
        }
      });
    }
  }, LOOKAHEAD);

  return next => async action => {
    let state;
    switch (action.type) {
      case 'STUDIO_PLAY':
        store.dispatch(playingStartTime(audioContext.currentTime));
        requestAnimationFrame(beatUpdate);
        state = store.getState().studio;
        store.dispatch(playingStartBeat(state.currentBeat));
        const schedulableSamples = [];
        state.tracks.forEach((track, i) => {
          schedulableSamples.push(...track.samples.filter(sample => {
            const [startTime, endTime] = getSampleTimes(audioContext, state, sample);
            sample.volume = track.volume;
            sample.track = i;
            sample.buffer = bufferStore[sample.url];
            sample.endTime = endTime;
            return endTime > audioContext.currentTime && startTime <= audioContext.currentTime;
          }));
        });

        schedulableSamples.forEach(sample => {
          if (!(sample.id in scheduledSamples)) {
            const source = scheduleSample(sample);
            scheduledSamples[sample.id] = { ...sample, ...source };
          }
        });
        break;

      case 'STUDIO_PAUSE':
        state = store.getState().studio;
        Object.entries(scheduledSamples).forEach(([id, sample]) => {
          console.log(sample);
          sample.source.stop();
          delete scheduledSamples[id];
        });
        break;

      case 'STUDIO_STOP':
        state = store.getState().studio;
        store.dispatch(playingStartBeat(state.loopEnabled ? state.loop.start : 1));
        store.dispatch(setCurrentBeat(state.loopEnabled ? state.loop.start : 1));
        Object.entries(scheduledSamples).forEach(([id, sample]) => {
          sample.source.stop();
          delete scheduledSamples[id];
        });
        break;

      case 'SET_TRACKS':
        // React to volume change
        Object.values(scheduledSamples).forEach(sample => {
          sample.gain.gain.setValueAtTime(action.tracks[sample.track].volume, audioContext.currentTime);
        });

        // Verify that all the tracks have buffers
        await store.dispatch(setSampleLoading(true));
        await Promise.all(action.tracks.map(async track => {
          await Promise.all(track.samples.map(async sample => {
            if (!bufferStore[sample.url]) {
              const res = await axios.get(sample.url, { responseType: 'arraybuffer' });
              const buffer = await audioContext.decodeAudioData(res.data);
              bufferStore[sample.url] = buffer;
            }
            sample.duration = bufferStore[sample.url].duration;
          }));
        }));
        store.dispatch(setSampleLoading(false));
        break;

      case 'SET_VOLUME':
        globalSongGain.gain.setValueAtTime(action.volume, audioContext.currentTime);
        break;

      default:
        break;
      };
    return next(action);
  };
};
