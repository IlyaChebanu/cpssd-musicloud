/* eslint-disable no-param-reassign */
import axios from 'axios';
import _ from 'lodash';
import {
  playingStartTime, setCurrentBeat, playingStartBeat, setSampleLoading, stop,
} from '../actions/studioActions';
import {
  audioContext, bufferStore,
} from '../helpers/constants';
import { lerp } from '../helpers/utils';

const LOOKAHEAD = 25; // ms
const OVERLAP = 100/* ms */ / 1000;

const getSampleTimes = (context, state, sample) => {
  const secondsPerBeat = 60 / state.tempo;
  const beatsPerSecond = state.tempo / 60;
  const { currentBeat } = state;

  let sampleTime = sample.time;
  // Use 100ms lookahead to set sampleTime if we're near the end of the loop
  if (
    state.loopEnabled
    && sample.time < currentBeat
    && currentBeat > state.loop.stop - 0.1 * beatsPerSecond
  ) {
    sampleTime = state.loop.stop + sample.time - state.loop.start;
  }

  const startTime = context.currentTime + (sampleTime - currentBeat) * secondsPerBeat;
  const offset = Math.max(0, (currentBeat - sampleTime) * secondsPerBeat);
  const endTime = (
    context.currentTime + sample.duration + (sampleTime - currentBeat) * secondsPerBeat
  );
  return [startTime, endTime, offset];
};


const scheduleSample = (state, sample, context = audioContext, offline = false) => {
  const [startTime, endTime, offset] = getSampleTimes(
    context,
    offline ? { ...state, currentBeat: 0 } : state,
    sample,
  );
  const source = context.createBufferSource();
  source.buffer = sample.buffer;

  const gain = context.createGain();
  const pan = context.createStereoPanner();
  source.connect(pan);
  pan.connect(gain);
  gain.connect(context.globalGain);

  const track = state.tracks[sample.track];
  const soloTrack = _.findIndex(state.tracks, 'solo');
  const solo = soloTrack !== -1 && soloTrack !== sample.track;
  let volume = 0;
  if (!solo) {
    volume = track.mute ? 0 : sample.volume;
  }
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, lerp(startTime, endTime, sample.fade.fadeIn));
  gain.gain.setValueAtTime(volume, lerp(startTime, endTime, 1 - sample.fade.fadeOut));
  gain.gain.linearRampToValueAtTime(0, endTime);
  pan.pan.setValueAtTime(track.pan, 0);

  source.start(startTime, offline ? 0 : offset);
  source.stop(endTime);
  return { source, gain, pan };
};

export const renderTracks = (studio) => {
  const samples = [];
  studio.tracks.forEach((track, i) => {
    track.samples.forEach((sample) => {
      sample.volume = track.volume;
      sample.track = i;
      sample.buffer = bufferStore[sample.url];
      samples.push(sample);
    });
  });

  const getEndTime = (sample) => sample.time + (sample.duration * (studio.tempo / 60));
  const latestSample = _.maxBy(samples, (sample) => getEndTime(sample));
  const songDuration = getEndTime(latestSample) * (60 / studio.tempo);

  const offlineAudioContext = new (
    window.OfflineAudioContext || window.webkitOfflineAudioContext
  )(2, songDuration * 44100, 44100);
  offlineAudioContext.globalGain = offlineAudioContext.createGain();
  offlineAudioContext.globalGain.connect(offlineAudioContext.destination);

  samples.forEach((sample) => {
    scheduleSample(studio, sample, offlineAudioContext, true);
  });

  return offlineAudioContext.startRendering();
};

export default (store) => {
  const scheduledSamples = {};


  // Update currentBeat in redux to animate seek bar
  const beatUpdate = () => {
    const state = store.getState().studio;
    if (state.playing && window.location.pathname !== '/studio') {
      store.dispatch(stop);
    }
    if (state.playing && window.location.pathname === '/studio') {
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
        Object.values(scheduledSamples).forEach((sample) => {
          sample.old = true;
        });
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
          return (
            endTime > audioContext.currentTime
              && startTime <= audioContext.currentTime
          )
          || (
            startTime >= audioContext.currentTime
              && startTime < audioContext.currentTime + OVERLAP
          );
        }));
      });

      // Schedule samples
      schedulableSamples.forEach((sample) => {
        if (!(sample.id in scheduledSamples) || scheduledSamples[sample.id].old) {
          const source = scheduleSample(state, sample);
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
            if (track.samples) {
              await Promise.all(track.samples.map(async (sample) => {
                if (!sample.fade) {
                  sample.fade = {
                    fadeIn: 0,
                    fadeOut: 0,
                  };
                }
                if (!bufferStore[sample.url]) {
                  await store.dispatch(setSampleLoading(true));
                  const res = await axios.get(sample.url, { responseType: 'arraybuffer' });
                  const buffer = await audioContext.decodeAudioData(res.data);
                  bufferStore[sample.url] = buffer;
                  store.dispatch(setSampleLoading(false));
                }
                sample.duration = bufferStore[sample.url].duration;
              }));
            }
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
        audioContext.globalGain.gain.setValueAtTime(action.volume, audioContext.currentTime);
        break;

      default:
        break;
    }
    return next(action);
  };
};
