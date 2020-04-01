export default (note) => {
  if (!note) return;
  if (note.sourceType === 'sampler') {
    try {
      note.source.stop();
    } catch (e) {
      console.error(e);
    }
    return;
  }
  if (note.sourceType === 'synth') {
    note.source.triggerRelease();
  }
};
