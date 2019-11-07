import { playingStartTime, setCurrentBeat, playingStartBeat, setTracks } from '../actions/studioActions';
import kick from '../assets/samples/kick23.wav';
import axios from 'axios';

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

  const buffers = {};


  let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  Promise.all(tracks.map(async track => {
    await Promise.all(track.samples.map(async sample => {
      if (!buffers[sample.url]) {
        const res = await axios.get(sample.url, { responseType: 'arraybuffer' });
        const buffer = await audioCtx.decodeAudioData(res.data);
        buffers[sample.url] = buffer;
      }
      sample.duration = buffers[sample.url].duration;
    }));
  })).then(() => {
    store.dispatch(setTracks(tracks));
  });

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

  const scheduledSamples = {};

  let scheduler = setInterval(() => {
    const state = store.getState().studio;
    if (state.playing) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const secondsPerBeat = 60 / state.tempo;

      const currentBeat = state.currentBeat;

      // Delete played samples
      Object.entries(scheduledSamples).forEach(([id, sample]) => {
        const endTime = audioCtx.currentTime + sample.duration + (sample.time - currentBeat) * secondsPerBeat;
        if (endTime < audioCtx.currentTime) {
          delete scheduledSamples[id];
        }
      });

      const schedulableSamples = [];
      state.tracks.forEach(track => {
        schedulableSamples.push(...track.samples.filter(sample => {
          return sample.time >= currentBeat && (sample.time - currentBeat) * secondsPerBeat < OVERLAP;
        }));
      });

      schedulableSamples.forEach(sample => {
        if (!(sample.id in scheduledSamples)) {
          const startTime = audioCtx.currentTime + (sample.time - currentBeat) * secondsPerBeat;
          const endTime = audioCtx.currentTime + sample.duration + (sample.time - currentBeat) * secondsPerBeat;
          // console.log('Scheduling sample', sample, 'at', audioCtx.currentTime, 'for', startTime, 'ending at', endTime);
          const src = audioCtx.createBufferSource();
          src.buffer = buffers[sample.url];
          src.connect(audioCtx.destination);
          src.start(startTime);
          src.stop(endTime);
          scheduledSamples[sample.id] = { ...sample, source: src };
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
          if (!(sample.id in scheduledSamples)) {
            const startTime = audioCtx.currentTime + (sample.time - currentBeat) * secondsPerBeat;
            const offset = (currentBeat - sample.time) * secondsPerBeat;
            const endTime = audioCtx.currentTime + sample.duration + (sample.time - currentBeat) * secondsPerBeat;
            // console.log('Scheduling old sample', sample, 'at', audioCtx.currentTime, 'offset', startTime, 'ending at', endTime, sample.time, currentBeat);
            const src = audioCtx.createBufferSource();
            src.buffer = buffers[sample.url];
            src.connect(audioCtx.destination);
            src.start(startTime, offset);
            src.stop(endTime);
            scheduledSamples[sample.id] = { ...sample, source: src };
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
