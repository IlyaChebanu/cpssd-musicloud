/* eslint-disable no-restricted-globals */
import lame from 'lamejs';

self.addEventListener('message', (e) => {
  // TODO: Make this async using web workers
  try {
    const encoder = new lame.Mp3Encoder(2, 44100, 128);
    const mp3Data = [];
    const sampleBlockSize = 576; // multiple of 576

    const { left, right } = e.data;
    const l = new Float32Array(left.length);
    const r = new Float32Array(right.length);

    // Convert to required format
    for (let i = 0; i < left.length; i += 1) {
      l[i] = left[i] * 32767.5;
      r[i] = right[i] * 32767.5;
    }

    for (let i = 0; i < left.length; i += sampleBlockSize) {
      const leftChunk = l.subarray(i, i + sampleBlockSize);
      const rightChunk = r.subarray(i, i + sampleBlockSize);
      const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    const mp3buf = encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    self.postMessage(mp3Data);
  } catch (err) {
    self.postMessage(err);
  }
}, false);
