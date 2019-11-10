export default (audioContext, state, sample) => {
  const secondsPerBeat = 60 / state.tempo;
  const currentBeat = state.currentBeat;
  const startTime = audioContext.currentTime + (sample.time - currentBeat) * secondsPerBeat;
  const offset = Math.max(0, (currentBeat - sample.time) * secondsPerBeat);
  const endTime = audioContext.currentTime + sample.duration + (sample.time - currentBeat) * secondsPerBeat;
  return [startTime, endTime, offset];
}