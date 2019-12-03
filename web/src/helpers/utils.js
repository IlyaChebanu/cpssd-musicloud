import lame from 'lamejs';

export const clamp = (min, max, val) => Math.max(min, Math.min(max, val));

export const lerp = (v0, v1, t) => (1 - t) * v0 + t * v1;

export const genId = () => (Math.random() + 1).toString(36).substring(7);

export const encodeMp3 = (stereoBuffer) => {
  // TODO: Make this async using web workers
  const encoder = new lame.Mp3Encoder(2, 44100, 128);

  const mp3Data = [];

  const sampleBlockSize = 576; // multiple of 576
  const left = stereoBuffer.getChannelData(0);
  const right = stereoBuffer.getChannelData(0);
  const l = new Float32Array(left.length);
  const r = new Float32Array(right.length);

  // Convert to required format
  for (let i = 0; i < left.length; i += 1) {
    l[i] = left[i] * 32767.5;
    r[i] = right[i] * 32767.5;
  }

  for (let i = 0; i < stereoBuffer.length; i += sampleBlockSize) {
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

  return mp3Data;
};

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
