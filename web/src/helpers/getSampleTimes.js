export default (audioContext, state, sample) => {
  const secondsPerBeat = 60 / state.tempo;
  const beatsPerSecond = state.tempo / 60;
  const { currentBeat } = state;

  let sampleTime = sample.time;
  // Use 100ms lookahead to set sampleTime if we're near the end of the loop
  if (
    state.loopEnabled
    && sample.time < currentBeat
    && currentBeat > state.loop.stop - 0.1 * beatsPerSecond
  ) {
    sampleTime = state.loop.stop + sample.time - state.loop.start;
  }

  const startTime = audioContext.currentTime + (sampleTime - currentBeat) * secondsPerBeat;
  const offset = Math.max(0, (currentBeat - sampleTime) * secondsPerBeat);
  const endTime = (
    audioContext.currentTime + sample.duration + (sampleTime - currentBeat) * secondsPerBeat
  );
  return [startTime, endTime, offset];
};
