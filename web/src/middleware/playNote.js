import Tone from 'tone';
import { bufferStore } from '../helpers/constants';

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
    const source = new Tone.BufferSource();
    source.buffer = bufferStore[url];
    source.playbackRate.setValueAtTime(Tone.intervalToFrequencyRatio(note.noteNumber - 40), 0);

    source.connect(destination);
    source.start(startTime, offset);
    return {
      source,
      sourceType: 'sampler',
    };
  }
  const synth = new Tone.Synth({
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 1,
    },
  });

  const frequency = 2 ** ((note.noteNumber - 49) / 12) * 440;
  synth.oscillator.frequency.value = frequency;
  synth.triggerAttack(frequency, `+${startTime - context.currentTime}`);
  if (endTime) {
    synth.triggerRelease(`+${endTime - context.currentTime}`);
  }


  synth.connect(destination);
  return {
    source: synth,
    sourceType: 'synth',
  };
};
