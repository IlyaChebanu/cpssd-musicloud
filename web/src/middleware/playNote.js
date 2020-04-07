import Tone from 'tone';
import { bufferStore } from '../helpers/constants';

Tone.context.latencyHint = 'fastest';

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

  const frequency = 2 ** ((note.noteNumber - 49) / 12) * 440;

  const synth = new Tone.Synth({
    envelope: {
      attack: 0.01,
      decay: 1,
      sustain: 1,
      release: 0.3,
    },
    oscillator: {
      type: 'triangle',
    },
  });

  synth.triggerAttack(
    frequency,
    startTime,
    note.velocity,
  );
  synth.oscillator.frequency.cancelScheduledValues();
  synth.oscillator.frequency.setValueAtTime(frequency);
  if (endTime) {
    synth.triggerRelease(endTime);
  }


  synth.connect(destination);
  return {
    source: synth,
    sourceType: 'synth',
  };
};
