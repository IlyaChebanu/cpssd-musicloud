import getSampleTimes from '../helpers/getSampleTimes';
import { audioContext, globalSongGain } from '../helpers/constants';
import store from '../store';


export default sample => {
  const state = store.getState().studio;
  const [startTime, endTime, offset] = getSampleTimes(audioContext, state, sample);
  const source = audioContext.createBufferSource();
  source.buffer = sample.buffer;

  const gain = audioContext.createGain();
  source.connect(gain);
  gain.connect(globalSongGain);

  gain.gain.setValueAtTime(sample.volume, audioContext.currentTime);

  source.start(startTime, offset);
  source.stop(endTime);
  return { source, gain };
}