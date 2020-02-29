import _ from 'lodash';

import encodeWorker from './mp3encoder.worker';

export const clamp = (min, max, val) => Math.max(min, Math.min(max, val));

export const lerp = (v0, v1, t) => v0 * (1 - t) + v1 * t;

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
