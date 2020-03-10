import _ from 'lodash';

import encodeWorker from './mp3encoder.worker';
import { audioContext } from './constants';

export const clamp = (min, max, val) => Math.max(min, Math.min(max, val));

export const lerp = (v0, v1, t) => clamp(v0, v1, v0 * (1 - t) + v1 * t);

export const map = (x, inMin, inMax, outMin, outMax) => (
  clamp(outMin, outMax, ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin)
);

export const toNormalRange = (min, max, v) => (v - min) / (max - min);

export const genId = () => (Math.random() + 1).toString(36).substring(7);

export const encodeMp3 = (stereoBuffer) => new Promise((resolve, reject) => {
  // eslint-disable-next-line new-cap
  const worker = new encodeWorker();
  const left = stereoBuffer.getChannelData(0);
  const right = stereoBuffer.getChannelData(1);
  worker.addEventListener('message', (e) => {
    if (_.isError(e.data)) {
      reject(e.data);
    } else {
      resolve(e.data);
    }
  }, false);

  worker.postMessage({ left, right });
});

export const forceDownload = (data, type, fileName) => {
  const anchor = document.createElement('a');
  document.body.appendChild(anchor);
  anchor.style = 'display: none';

  const blob = new Blob(data, { type });
  const url = window.URL.createObjectURL(blob);
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(anchor);
};

export const sliceBuffer = (buffer, begin, end = null) => {
  const { duration } = buffer;
  const channels = buffer.numberOfChannels;
  const rate = buffer.sampleRate;

  // eslint-disable-next-line no-param-reassign
  end = end || duration;

  if (begin < 0) {
    throw new RangeError('begin time must be greater than 0');
  }

  if (end > duration) {
    throw new RangeError(`end time must be less than or equal to ${duration}`);
  }

  const startOffset = rate * begin;
  const endOffset = rate * end;
  const frameCount = endOffset - startOffset;

  const newArrayBuffer = audioContext.createBuffer(channels, endOffset - startOffset, rate);
  const anotherArray = new Float32Array(frameCount);
  const offset = 0;

  for (let channel = 0; channel < channels; channel += 1) {
    buffer.copyFromChannel(anotherArray, channel, startOffset);
    newArrayBuffer.copyToChannel(anotherArray, channel, offset);
  }
  return newArrayBuffer;
};
