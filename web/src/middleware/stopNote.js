export default (note) => {
  if (!note) return;
  if (note.sourceType === 'sampler') {
    try {
      if (note.source) note.source.stop();
    } catch (e) {
      console.error(e);
    }
    return;
  }
  if (note.sourceType === 'synth') {
    if (note.source) note.source.triggerRelease();
  }
};
