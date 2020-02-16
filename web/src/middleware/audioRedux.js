/* eslint-disable no-param-reassign */
import axios from 'axios';
import _ from 'lodash';
import Reverb from 'soundbank-reverb';
import {
  playingStartTime, setCurrentBeat, playingStartBeat, setSampleLoading, stop,
} from '../actions/studioActions';
import {
  audioContext, bufferStore,
} from '../helpers/constants';
import { lerp, genId } from '../helpers/utils';

const getEffectsObject = (context, sample) => {
  const obj = {
    context,
    pan: context.createStereoPanner(),
    reverb: Reverb(context),
    gain: context.createGain(),
  };

  obj.reverb.time = sample.reverb.time * 10;
  obj.reverb.wet.value = sample.reverb.wet;
  obj.reverb.dry.value = sample.reverb.dry;
  obj.reverb.cutoff.value = sample.reverb.cutoff * 10000;
  return obj;
};

const getSampleTimes = (currentTime, state, sample, scheduleAhead) => {
  const secondsPerBeat = 60 / state.tempo;
  const currentBeat = sample.offline ? 1 : state.currentBeat;

  let sampleTime = sample.time;
  if (scheduleAhead) {
    sampleTime = state.loop.stop + sample.time - state.loop.start;
  }

  const startTime = currentTime + (sampleTime - currentBeat) * secondsPerBeat;
  const offset = Math.max(0, (currentBeat - sampleTime) * secondsPerBeat);
  const endTime = (
    currentTime + sample.duration + (sampleTime - currentBeat) * secondsPerBeat
  );
  return { startTime, endTime, offset };
};


const scheduleSample = (currentTime, state, sample, scheduleAhead) => {
  const { startTime, endTime, offset } = getSampleTimes(
    currentTime,
    state,
    sample,
    scheduleAhead,
  );

  const effects = getEffectsObject(sample.context, sample);

  const source = effects.context.createBufferSource();
  source.buffer = bufferStore[sample.id].buffer;
  source.connect(effects.pan);
  effects.pan.connect(effects.gain);
  effects.gain.connect(sample.context.globalGain);

  const track = state.tracks[sample.track];
  const soloTrack = _.findIndex(state.tracks, 'solo');
  const solo = soloTrack !== -1 && soloTrack !== sample.track;
  let volume = 0;
  if (!solo) {
    volume = track.mute ? 0 : sample.volume;
  }

  effects.gain.gain.setValueAtTime(0, startTime);
  effects.gain.gain.linearRampToValueAtTime(
    volume,
    lerp(startTime, endTime, sample.fade.fadeIn),
  );
  effects.gain.gain.setValueAtTime(
    volume,
    lerp(startTime, endTime, 1 - sample.fade.fadeOut),
  );
  effects.gain.gain.linearRampToValueAtTime(0, endTime);
  effects.pan.pan.setValueAtTime(track.pan, 0);

  source.start(startTime, offset);
  return { source, effects };
};

export const renderTracks = (studio) => {
  const samples = [];
  studio.tracks.forEach((track) => {
    track.samples.forEach((sample) => {
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
    sample = { ...sample, ...bufferStore[sample.id] };
    sample.context = offlineAudioContext;
    sample.offline = true;
    scheduleSample(offlineAudioContext.currentTime, studio, sample);
  });

  return offlineAudioContext.startRendering();
};

export default (store) => {
  const scheduledSamples = {};


  // Update currentBeat in redux to animate seek bar
  const beatUpdate = () => {
    let state = store.getState().studio;
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
        currentBeat = state.loop.start + currentBeat - state.loop.stop;
        store.dispatch(setCurrentBeat(currentBeat));
        store.dispatch(playingStartBeat(state.loop.start));
        store.dispatch(playingStartTime(audioContext.currentTime));
        state = store.getState().studio;
        Object.values(scheduledSamples).forEach((sample) => {
          sample.old = true;
        });
        const samples = [];
        state.tracks.forEach((track) => {
          track.samples.forEach((sample) => {
            if (sample.time + (sample.duration * (state.tempo / 60)) < state.currentBeat) {
              return;
            }
            if (state.loopEnabled && sample.time > state.loop.stop) {
              return;
            }
            samples.push(sample);
          });
        });

        samples.forEach((sample) => {
          sample = { ...sample, ...bufferStore[sample.id] };
          sample.schedulerId = genId();
          sample.context = audioContext;
          const nextLoop = scheduleSample(audioContext.currentTime, state, sample, true);
          scheduledSamples[`${sample.schedulerId}next`] = {
            ...sample,
            source: nextLoop.source,
            effects: nextLoop.effects,
          };
        });
      } else {
        store.dispatch(setCurrentBeat(currentBeat));
      }
    }
  };

  return (next) => async (action) => {
    let state;
    switch (action.type) {
      case 'STUDIO_PLAY': {
        store.dispatch(playingStartTime(audioContext.currentTime));
        state = store.getState().studio;
        store.dispatch(playingStartBeat(state.currentBeat));
        state.playingStartBeat = state.currentBeat;
        requestAnimationFrame(beatUpdate);

        const samples = [];
        state.tracks.forEach((track) => {
          track.samples.forEach((sample) => {
            if (
              (state.loopEnabled
                && (sample.time + (sample.duration * (state.tempo / 60)) >= state.loop.start
                && sample.time < state.loop.stop)
              )
            ) {
              samples.push(sample);
            }
          });
        });

        samples.forEach((sample) => {
          sample = { ...sample, ...bufferStore[sample.id] };
          sample.schedulerId = genId();
          sample.context = audioContext;
          const currentLoop = scheduleSample(audioContext.currentTime, state, sample);
          const nextLoop = scheduleSample(audioContext.currentTime, state, sample, true);
          scheduledSamples[sample.schedulerId] = {
            ...sample,
            source: currentLoop.source,
            effects: currentLoop.effects,
          };
          scheduledSamples[`${sample.schedulerId}next`] = {
            ...sample,
            source: nextLoop.source,
            effects: nextLoop.effects,
          };
        });
        break;
      }

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

        // Verify that all the tracks have bufferscs
        if (action.tracks) {
          await Promise.all(action.tracks.map(async (track, i) => {
            if (track.samples) {
              await Promise.all(track.samples.map(async (sample) => {
                sample.fade = {
                  fadeIn: 0,
                  fadeOut: 0,
                  ...sample.fade,
                };
                sample.reverb = {
                  wet: 1,
                  dry: 1,
                  cutoff: 0,
                  time: 0.3,
                  ...sample.reverb,
                };
                sample.track = i;
                sample.volume = track.volume;

                if (!(sample.id in bufferStore)) {
                  await store.dispatch(setSampleLoading(true));
                  const res = await axios.get(sample.url, { responseType: 'arraybuffer' });
                  const buffer = await audioContext.decodeAudioData(res.data);
                  bufferStore[sample.id] = {
                    buffer,
                    duration: buffer.duration,
                    webAudio: getEffectsObject(audioContext, sample),
                    sample,
                  };
                  store.dispatch(setSampleLoading(false));
                }
              }));
            }
          }));
        }
        break;

      case 'SET_TRACK':
        state = store.getState().studio;
        // React to volume change
        // Object.values(scheduledSamples).forEach((sample) => {
        //   const track = state.tracks[sample.track];
        //   const soloTrack = _.findIndex(state.tracks, 'solo');
        //   const solo = soloTrack !== -1 && soloTrack !== sample.track;
        //   let newVol = 0;
        //   if (!solo) {
        //     newVol = track.mute ? 0 : track.volume;
        //   }
        //   sample.gain.gain.setValueAtTime(newVol, audioContext.currentTime);
        //   sample.pan.pan.setValueAtTime(track.pan, audioContext.currentTime);
        // });

        // Verify that all the track has buffers
        // await Promise.all(action.track.samples.map(async (sample) => {
        //   if (!bufferStore[sample.url]) {
        //     await store.dispatch(setSampleLoading(true));
        //     const res = await axios.get(sample.url, { responseType: 'arraybuffer' });
        //     const buffer = await audioContext.decodeAudioData(res.data);
        //     bufferStore[sample.url] = buffer;
        //     store.dispatch(setSampleLoading(false));
        //   }
        //   sample.duration = bufferStore[sample.url].duration;
        // }));
        break;

      case 'SET_VOLUME':
        audioContext.globalGain.gain.setValueAtTime(action.volume, audioContext.currentTime);
        break;

      case 'SET_SAMPLE_REVERB': {
        const sample = bufferStore[action.id];
        sample.webAudio.reverb.time = action.reverb.time * 10;
        sample.webAudio.reverb.wet.value = action.reverb.wet;
        sample.webAudio.reverb.dry.value = action.reverb.dry;
        sample.webAudio.reverb.cutoff.value = action.reverb.cutoff * 10000;

        break;
      }

      default:
        break;
    }
    return next(action);
  };
};
