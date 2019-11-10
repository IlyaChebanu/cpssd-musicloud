import { playingStartTime, setCurrentBeat, playingStartBeat, setTracks } from '../actions/studioActions';
import kick from '../assets/samples/kick23.wav';
import axios from 'axios';
import scheduleSample from '../helpers/scheduleSample';
import bufferStore from '../bufferStore';
import getSampleTimes from '../helpers/getSampleTimes';

const LOOKAHEAD = 25; //ms
const OVERLAP = 100/*ms*/ / 1000;

export default store => {

  const tracks = [
    {
      samples: [
        {
          id: 1,
          time: 1,
          url: kick
        },
        {
          id: 2,
          time: 2,
          url: kick
        },
        {
          id: 3,
          time: 3,
          url: kick
        },
        {
          id: 4,
          time: 4,
          url: kick
        },
      ]
    }
  ];


  let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const scheduledSamples = {};


  // Download all tracks and store buffers into the bufferStore
  Promise.all(tracks.map(async track => {
    await Promise.all(track.samples.map(async sample => {
      if (!bufferStore[sample.url]) {
        const res = await axios.get(sample.url, { responseType: 'arraybuffer' });
        const buffer = await audioCtx.decodeAudioData(res.data);
        bufferStore[sample.url] = buffer;
      }
      sample.duration = bufferStore[sample.url].duration;
    }));
  })).then(() => {
    store.dispatch(setTracks(tracks));
  });

  // Update currentBeat in redux to animate seek bar
  const beatUpdate = () => {
    const state = store.getState().studio;
    if (state.playing) {
      requestAnimationFrame(beatUpdate);
      const secondsPerBeat = 60 / state.tempo;
      const currentBeat = state.playingStartBeat + (audioCtx.currentTime - state.playingStartTime) / secondsPerBeat;
      store.dispatch(setCurrentBeat(currentBeat));
    }
  }

  let scheduler = setInterval(() => {
    const state = store.getState().studio;
    if (state.playing) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Delete played samples
      Object.entries(scheduledSamples).forEach(([id, sample]) => {
        const [_, endTime] = getSampleTimes(audioCtx, state, sample);
        if (endTime < audioCtx.currentTime) {
          delete scheduledSamples[id];
        }
      });

      // Find schedulable samples
      const schedulableSamples = [];
      state.tracks.forEach(track => {
        schedulableSamples.push(...track.samples.filter(sample => {
          const [startTime] = getSampleTimes(audioCtx, state, sample);
          return startTime >= audioCtx.currentTime && startTime < startTime + OVERLAP;
        }));
      });

      // Schedule samples
      schedulableSamples.forEach(sample => {
        if (!(sample.id in scheduledSamples)) {
          const source = scheduleSample(audioCtx, state, sample, bufferStore[sample.url]);
          scheduledSamples[sample.id] = { ...sample, source };
        }
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
        const schedulableSamples = [];
        state.tracks.forEach(track => {
          schedulableSamples.push(...track.samples.filter(sample => {
            const [startTime, endTime] = getSampleTimes(audioCtx, state, sample);
            return endTime > audioCtx.currentTime && startTime <= audioCtx.currentTime;
          }));
        });

        schedulableSamples.forEach(sample => {
          if (!(sample.id in scheduledSamples)) {
            const source = scheduleSample(audioCtx, state, sample, bufferStore[sample.url]);
            scheduledSamples[sample.id] = { ...sample, source };
          }
        });
        break;

      case 'STUDIO_PAUSE':
        state = store.getState().studio;
        store.dispatch(playingStartBeat(state.currentBeat));
        Object.entries(scheduledSamples).forEach(([id, sample]) => {
          sample.source.stop();
          delete scheduledSamples[id];
        });
        break;

      case 'STUDIO_STOP':
        store.dispatch(playingStartBeat(1));
        store.dispatch(setCurrentBeat(1));
        Object.entries(scheduledSamples).forEach(([id, sample]) => {
          sample.source.stop();
          delete scheduledSamples[id];
        });
        break;

      default:
        break;
      };
    return next(action);
  };
};
