import getSampleTimes from '../helpers/getSampleTimes';

export default (audioContext, state, sample, buffer) => {
  const [startTime, endTime, offset] = getSampleTimes(audioContext, state, sample);
  const src = audioContext.createBufferSource();
  src.buffer = buffer;
  src.connect(audioContext.destination);
  src.start(startTime, offset);
  src.stop(endTime);
  return src;
}