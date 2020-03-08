import { audioContext } from '../helpers/constants';

export default (sample) => {
  sample.popFilter.gain.setValueAtTime(1, 0);
  sample.popFilter.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.01);

  if (sample.source) {
    sample.source.stop(audioContext.currentTime + 0.01);
  }

  if (sample.notes) {
    Object.values(sample.notes).forEach((note) => {
      if (note.source) {
        note.source.stop(audioContext.currentTime + 0.01);
      }
    });
  }
};
