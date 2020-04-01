import Tone from 'tone';
// eslint-disable-next-line import/no-cycle
import store from '../store';
import beatsToSeconds from './beatsToSeconds';
import playSample from './playSample';
import playNote from './playNote';
import setFadeCurve from './setFadeCurve';


// eslint-disable-next-line consistent-return
export default (sample, channel, context = Tone.context.rawContext, isOffline = false) => {
  const { studio } = store.getState();

  const currentBeat = isOffline ? 1 : studio.currentBeat;

  // Scheduling / Timing calculations
  const startTime = context.currentTime + beatsToSeconds(sample.time - currentBeat, studio.tempo);
  const endTime = context.currentTime + beatsToSeconds(
    sample.time + sample.duration - currentBeat,
    studio.tempo,
  );
  const offset = Math.max(0, beatsToSeconds(currentBeat - sample.time, studio.tempo));


  // Create audio note graph section
  const gain = context.createGain();
  const popFilter = context.createGain();

  gain.connect(popFilter);
  popFilter.connect(channel);


  setFadeCurve(gain, context, startTime, endTime, sample.fade.fadeIn, sample.fade.fadeOut);


  popFilter.gain.setValueAtTime(0.001, 0);
  popFilter.gain.exponentialRampToValueAtTime(1, startTime + offset + 0.01);
  popFilter.gain.setValueAtTime(1, endTime - 0.01);
  popFilter.gain.exponentialRampToValueAtTime(0.001, endTime);

  if (sample.type === 'sample') {
    const source = playSample(context, sample.url, gain, startTime, offset, endTime);

    return {
      ...sample, source, gain, popFilter,
    };
  }

  if (sample.type === 'pattern') {
    const notes = {};
    Object.entries(sample.notes).forEach(([noteId, note]) => {
      const noteTime = sample.time + note.tick * (0.25 / studio.ppq);
      const noteDuration = note.duration * (0.25 / studio.ppq);

      const noteStartTime = context.currentTime + beatsToSeconds(
        noteTime - currentBeat, studio.tempo,
      );
      const noteEndTime = context.currentTime + beatsToSeconds(
        noteTime + noteDuration - currentBeat,
        studio.tempo,
      );
      const noteOffset = Math.max(0, beatsToSeconds(currentBeat - noteTime, studio.tempo));

      // TODO: popFilter per note

      const source = playNote(
        context,
        note,
        gain,
        noteStartTime,
        noteOffset,
        noteEndTime,
        sample.url,
      );
      notes[noteId] = {
        ...note,
        ...source,
      };
    });

    return {
      ...sample, notes, gain, popFilter,
    };
  }
};
