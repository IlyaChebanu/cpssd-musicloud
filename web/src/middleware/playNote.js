import Tone from 'tone';
import { audioContext, bufferStore } from '../helpers/constants';
import { sliceBuffer } from '../helpers/utils';

Tone.setContext(audioContext);

export default (
  context,
  note,
  destination,
  startTime,
  offset = 0,
  endTime = null,
  url = null,
  synthControls = {
    waveType: 'triangle',
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.9,
      release: 1,
    },
    filter: {
      Q: 6,
      type: 'lowpass',
      rolloff: -24,
    },
    filterEnvelope: {
      attack: 0.06,
      decay: 0.2,
      sustain: 0.5,
      release: 2,
      baseFrequency: 200,
      octaves: 7,
      exponent: 2,
    },
  },
) => {
  let synth;
  const frequency = 2 ** ((note.noteNumber - 49) / 12) * 440;

  if (url) {
    const buffer = bufferStore[url];
    const offsetScaled = offset * ((39 - note.noteNumber) / 12) ** 2;
    if (offsetScaled > buffer.duration) {
      return null;
    }
    const slice = sliceBuffer(buffer, offsetScaled);
    synth = new Tone.Sampler({
      C4: slice,
    });
    synth.attack = synthControls.envelope.attack;
    synth.release = synthControls.envelope.release;
  } else {
    synth = new Tone.MonoSynth({
      oscillator: {
        type: synthControls.waveType,
      },
      envelope: synthControls.envelope,
      filter: synthControls.filter,
      filterEnvelope: synthControls.filterEnvelope,
    });
  }

  synth.connect(destination);
  synth.triggerAttack(frequency, `+${startTime - context.currentTime}`);
  if (endTime) {
    synth.triggerRelease(`+${endTime - context.currentTime}`);
  }
  return synth;
};
