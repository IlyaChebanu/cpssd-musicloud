/* eslint-disable no-param-reassign */
import axios from 'axios';
import _ from 'lodash';
import {
  playingStartTime, setCurrentBeat, playingStartBeat, setSampleLoading,
} from '../actions/studioActions';
import getSampleTimes from '../helpers/getSampleTimes';
import { globalSongGain, audioContext, bufferStore } from '../helpers/constants';

const LOOKAHEAD = 25; // ms
const OVERLAP = 100/* ms */ / 1000;

const scheduleSample = (store, sample) => {
  const state = store.getState().studio;
  const [startTime, endTime, offset] = getSampleTimes(audioContext, state, sample);
  const source = audioContext.createBufferSource();
  source.buffer = sample.buffer;

  const gain = audioContext.createGain();
  const pan = audioContext.createStereoPanner();
  source.connect(pan);
  pan.connect(gain);
  gain.connect(globalSongGain);

  const track = state.tracks[sample.track];
  const soloTrack = _.findIndex(state.tracks, 'solo');
  const solo = soloTrack !== -1 && soloTrack !== sample.track;
  let volume = 0;
  if (!solo) {
    volume = track.mute ? 0 : sample.volume;
  }
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  pan.pan.setValueAtTime(track.pan, audioContext.currentTime);

  source.start(startTime, offset);
  source.stop(endTime);
  return { source, gain, pan };
};

export default (store) => {
  const scheduledSamples = {};


  // Update currentBeat in redux to animate seek bar
  const beatUpdate = () => {
    const state = store.getState().studio;
    if (state.playing) {
      requestAnimationFrame(beatUpdate);
      const secondsPerBeat = 60 / state.tempo;
      let currentBeat = (
        state.playingStartBeat
          + (audioContext.currentTime - state.playingStartTime)
          / secondsPerBeat
      );
      if (state.loopEnabled && currentBeat > state.loop.stop) {
        currentBeat = state.loop.start;
        store.dispatch(playingStartBeat(state.loop.start));
        store.dispatch(playingStartTime(audioContext.currentTime));
      }
      store.dispatch(setCurrentBeat(currentBeat));
    }
  };

  setInterval(() => {
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
        schedulableSamples.push(...track.samples.filter((sample) => {
          const [startTime, endTime] = getSampleTimes(audioContext, state, sample);
          sample.volume = track.volume;
          sample.track = i;
          sample.buffer = bufferStore[sample.url];
          sample.endTime = endTime;
          return (endTime > audioContext.currentTime && startTime <= audioContext.currentTime)
            || (startTime >= audioContext.currentTime && startTime < startTime + OVERLAP);
        }));
      });

      // Schedule samples
      schedulableSamples.forEach((sample) => {
        if (!(sample.id in scheduledSamples)) {
          const source = scheduleSample(store, sample);
          scheduledSamples[sample.id] = { ...sample, ...source };
        }
      });
    }
  }, LOOKAHEAD);

  return (next) => async (action) => {
    let state;
    switch (action.type) {
      case 'STUDIO_PLAY':
        store.dispatch(playingStartTime(audioContext.currentTime));
        requestAnimationFrame(beatUpdate);
        state = store.getState().studio;
        store.dispatch(playingStartBeat(state.currentBeat));
        break;

      case 'STUDIO_PAUSE':
        state = store.getState().studio;
        Object.entries(scheduledSamples).forEach(([id, sample]) => {
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
        Object.values(scheduledSamples).forEach((sample) => {
          const track = action.tracks[sample.track];
          const soloTrack = _.findIndex(action.tracks, 'solo');
          const solo = soloTrack !== -1 && soloTrack !== sample.track;
          let volume = 0;
          if (!solo) {
            volume = track.mute ? 0 : track.volume;
          }
          sample.gain.gain.setValueAtTime(volume, audioContext.currentTime);
          sample.pan.pan.setValueAtTime(track.pan, audioContext.currentTime);
        });

        // Verify that all the tracks have buffers
        if (action.tracks) {
          await Promise.all(action.tracks.map(async (track) => {
            await Promise.all(track.samples.map(async (sample) => {
              if (!bufferStore[sample.url]) {
                await store.dispatch(setSampleLoading(true));
                const res = await axios.get(sample.url, { responseType: 'arraybuffer' });
                const buffer = await audioContext.decodeAudioData(res.data);
                bufferStore[sample.url] = buffer;
                store.dispatch(setSampleLoading(false));
              }
              sample.duration = bufferStore[sample.url].duration;
            }));
          }));
        }
        break;

      case 'SET_TRACK':
        state = store.getState().studio;
        // React to volume change
        Object.values(scheduledSamples).forEach((sample) => {
          const track = state.tracks[sample.track];
          const soloTrack = _.findIndex(state.tracks, 'solo');
          const solo = soloTrack !== -1 && soloTrack !== sample.track;
          let newVol = 0;
          if (!solo) {
            newVol = track.mute ? 0 : track.volume;
          }
          sample.gain.gain.setValueAtTime(newVol, audioContext.currentTime);
          sample.pan.pan.setValueAtTime(track.pan, audioContext.currentTime);
        });

        // Verify that all the track has buffers
        await Promise.all(action.track.samples.map(async (sample) => {
          if (!bufferStore[sample.url]) {
            await store.dispatch(setSampleLoading(true));
            const res = await axios.get(sample.url, { responseType: 'arraybuffer' });
            const buffer = await audioContext.decodeAudioData(res.data);
            bufferStore[sample.url] = buffer;
            store.dispatch(setSampleLoading(false));
          }
          sample.duration = bufferStore[sample.url].duration;
        }));
        break;

      case 'SET_VOLUME':
        globalSongGain.gain.setValueAtTime(action.volume, audioContext.currentTime);
        break;

      default:
        break;
    }
    return next(action);
  };
};
