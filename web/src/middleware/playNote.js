import Tone from 'tone';
import playSample from './playSample';
import { audioContext } from '../helpers/constants';

Tone.setContext(audioContext);

export default (
  context,
  note,
  destination,
  startTime,
  offset = 0,
  endTime = null,
  url = null,
) => {
  if (url) {
    return playSample(context, url, destination, startTime, offset, endTime);
  }

  const synth = new Tone.Synth();
  const frequency = 2 ** ((note.noteNumber - 49) / 12) * 440;

  synth.oscillator.frequency.value = frequency;

  synth.connect(destination);
  synth.triggerAttack(frequency, `+${startTime - context.currentTime}`);
  if (endTime) {
    synth.triggerRelease(`+${endTime - context.currentTime}`);
  }
  return synth;
};
