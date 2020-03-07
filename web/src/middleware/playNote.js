import playSample from './playSample';

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
  const source = context.createOscillator();
  source.frequency.setValueAtTime(2 ** ((note.noteNumber - 49) / 12) * 440, 0);
  source.connect(destination);
  source.start(startTime, offset);
  if (endTime) {
    source.stop(endTime);
  }
  return source;
};
