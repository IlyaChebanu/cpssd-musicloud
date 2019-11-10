import { playingStartTime, setCurrentBeat, playingStartBeat, setTracks, setSampleLoading } from '../actions/studioActions';
import kick from '../assets/samples/kick23.wav';
import bass from '../assets/samples/bass.wav';
import axios from 'axios';
import scheduleSample from '../helpers/scheduleSample';
import getSampleTimes from '../helpers/getSampleTimes';
import { globalSongGain, audioContext, bufferStore } from '../helpers/constants';

const LOOKAHEAD = 25; //ms
const OVERLAP = 100/*ms*/ / 1000;

export default store => {

  const tracks = [
    {
      volume: 0.25,
      samples: [
        {
          id: 1,
          time: 1,
          url: bass
        },
        {
          id: 3,
          time: 3,
          url: bass
        },
      ]
    },
    {
      volume: 1,
      samples: [
        {
          id: 2,
          time: 2,
          url: bass
        },
        {
          id: 4,
          time: 4,
          url: bass
        },
      ]
    }
  ];

  // Only for testing purposes
  setTimeout(() => {
    store.dispatch(setTracks(tracks));
  }, 0);

  const scheduledSamples = {};


  // Update currentBeat in redux to animate seek bar
  const beatUpdate = () => {
    const state = store.getState().studio;
    if (state.playing) {
      requestAnimationFrame(beatUpdate);
      const secondsPerBeat = 60 / state.tempo;
      const currentBeat = state.playingStartBeat + (audioContext.currentTime - state.playingStartTime) / secondsPerBeat;
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
        const [_, endTime] = getSampleTimes(audioContext, state, sample);
        if (endTime < audioContext.currentTime) {
          delete scheduledSamples[id];
        }
      });

      // Find schedulable samples
      const schedulableSamples = [];
      state.tracks.forEach((track, i) => {
        schedulableSamples.push(...track.samples.filter(sample => {
          const [startTime] = getSampleTimes(audioContext, state, sample);
          sample.volume = track.volume;
          sample.track = i;
          sample.buffer = bufferStore[sample.url];
          return startTime >= audioContext.currentTime && startTime < startTime + OVERLAP;
        }));
      });

      // Schedule samples
      schedulableSamples.forEach(sample => {
        if (!(sample.id in scheduledSamples)) {
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
        const schedulableSamples = [];
        state.tracks.forEach((track, i) => {
          schedulableSamples.push(...track.samples.filter(sample => {
            sample.volume = track.volume;
            sample.track = i;
            sample.buffer = bufferStore[sample.url];
            const [startTime, endTime] = getSampleTimes(audioContext, state, sample);
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
        store.dispatch(playingStartBeat(state.currentBeat));
        Object.entries(scheduledSamples).forEach(([id, sample]) => {
          console.log(sample);
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
