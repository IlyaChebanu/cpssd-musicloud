import getSampleTimes from '../helpers/getSampleTimes';
import { audioContext, globalSongGain } from '../helpers/constants';
import store from '../store';
import _ from 'lodash';

export default sample => {
  const state = store.getState().studio;
  const [startTime, endTime, offset] = getSampleTimes(audioContext, state, sample);
  const source = audioContext.createBufferSource();
  source.buffer = sample.buffer;

  const gain = audioContext.createGain();
  const pan = audioContext.createStereoPanner();
  source.connect(pan);
  pan.connect(gain);
  gain.connect(globalSongGain);

  const track = state.tracks[sample.track];
  const soloTrack = _.findIndex(state.tracks, 'solo');
  const solo = soloTrack !== -1 && soloTrack !== sample.track;
  const volume = solo ? 0 : track.mute ? 0 : sample.volume;
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  pan.pan.setValueAtTime(track.pan, audioContext.currentTime);

  source.start(startTime, offset);
  source.stop(endTime);
  return { source, gain, pan };
}