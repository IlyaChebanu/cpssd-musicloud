import Tone from 'tone';
import { bufferStore } from '../helpers/constants';

const samplers = {};

samplers.initializeSampler = (url) => {
  if (!samplers[url]) {
    samplers[url] = new Tone.Sampler({
      C4: bufferStore[url],
    });
    samplers[url].attack = 0.005;
    samplers[url].release = 0.005;
  }
  return samplers[url];
};

export default samplers;
