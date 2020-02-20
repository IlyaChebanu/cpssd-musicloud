/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import styles from './PianoNote.module.scss';
import { colours } from '../../helpers/constants';
import { setTrackAtIndex } from '../../actions/studioActions';

const ppq = 1;

const PianoNote = memo(({
  noteData, selectedTrack, tracks, dispatch, selectedSample,
}) => {
  const wrapperStyle = useMemo(() => ({
    backgroundColor: colours[selectedTrack],
    width: noteData.duration * (1 / ppq) * 40 - 1,
    left: noteData.tick * (1 / ppq) * 40 + 1,
    top: (88 - noteData.noteNumber) * 20 + 10,
  }), [noteData.duration, noteData.noteNumber, noteData.tick, selectedTrack]);

  const gridSize = 1;
  const gridSnapEnabled = true;

  const handleDragNote = useCallback((ev) => {
    ev.stopPropagation();
    const initialMousePos = ev.screenX;
    const initialPosY = ev.screenY;
    const initialTime = noteData.tick;
    const initialNote = noteData.noteNumber;
    const handleMouseMove = (e) => {
      e.preventDefault();
      const start = (
        initialTime + (e.screenX - initialMousePos) / (40 * gridSize) / window.devicePixelRatio
      );
      const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
      const time = gridSnapEnabled
        ? Number((Math.round((start) * gridSize) / gridSize).toFixed(numDecimalPlaces))
        : start;

      const newNoteNumber = Math.round(
        initialNote - (e.screenY - initialPosY) / 20 / window.devicePixelRatio,
      );

      const track = { ...tracks[selectedTrack] };
      const sampleIndex = _.findIndex(track.samples, (s) => s.id === selectedSample);
      track.samples[sampleIndex].notes[noteData.idx].tick = Math.max(0, time);
      track.samples[sampleIndex].notes[noteData.idx].noteNumber = Math.min(88, Math.max(1, newNoteNumber));
      dispatch(setTrackAtIndex(track, selectedTrack));
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [
    dispatch,
    gridSnapEnabled,
    noteData.idx,
    noteData.noteNumber,
    noteData.tick,
    selectedSample,
    selectedTrack,
    tracks,
  ]);

  const handleResize = useCallback((ev) => {
    ev.stopPropagation();
    const initialMousePos = ev.screenX;
    const initialDuration = noteData.duration;
    const handleMouseMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const start = (
        initialDuration + (e.screenX - initialMousePos) / (40 * gridSize) / window.devicePixelRatio
      );
      const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
      const time = gridSnapEnabled
        ? Number((Math.round((start) * gridSize) / gridSize).toFixed(numDecimalPlaces))
        : start;

      const track = { ...tracks[selectedTrack] };
      const sampleIndex = _.findIndex(track.samples, (s) => s.id === selectedSample);
      const notes = [...track.samples[sampleIndex].notes];
      notes[noteData.idx] = { ...notes[noteData.idx], duration: Math.max(0, time) };
      track.samples[sampleIndex].notes = notes;
      track.samples = [...track.samples];
      dispatch(setTrackAtIndex(track, selectedTrack));
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [
    dispatch,
    gridSnapEnabled,
    noteData.duration,
    noteData.idx,
    selectedSample,
    selectedTrack,
    tracks,
  ]);

  const handleDelete = useCallback((e) => {
    e.preventDefault();
    const track = { ...tracks[selectedTrack] };
    const sampleIndex = _.findIndex(track.samples, (s) => s.id === selectedSample);
    const notes = track.samples[sampleIndex].notes.filter((_, i) => i !== noteData.idx);
    track.samples[sampleIndex].notes = notes;
    dispatch(setTrackAtIndex(track, selectedTrack));
  }, [dispatch, noteData.idx, selectedSample, selectedTrack, tracks]);

  return (
    <div
      className={styles.wrapper}
      style={wrapperStyle}
      onMouseDown={handleDragNote}
      onContextMenu={handleDelete}
    >
      <div
        className={styles.resizeHandle}
        onMouseDown={handleResize}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
});

PianoNote.propTypes = {
  noteData: PropTypes.object.isRequired,
  selectedTrack: PropTypes.number.isRequired,
  selectedSample: PropTypes.string,
  tracks: PropTypes.arrayOf(PropTypes.object),
  dispatch: PropTypes.func.isRequired,
};

PianoNote.defaultProps = {
  tracks: [],
  selectedSample: '',
};

PianoNote.displayName = 'PianoNote';

const mapStateToProps = ({ studio }) => ({
  selectedTrack: studio.selectedTrack,
  selectedSample: studio.selectedSample,
  tracks: studio.tracks,
});

export default connect(mapStateToProps)(PianoNote);
