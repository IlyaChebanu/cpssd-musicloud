/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, {
  memo, useMemo, useCallback, useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import styles from './PianoNote.module.scss';
import { colours } from '../../helpers/constants';
import { useGlobalDrag } from '../../helpers/hooks';
import {
  setPatternNoteTick, setPatternNoteNumber, setPatternNoteDuration, removePatternNote,
} from '../../actions/studioActions';

const ppq = 1;

const PianoNote = memo(({
  noteData, selectedTrack, tracks, dispatch, selectedSample,
}) => {
  const gridSize = 1;
  const gridSnapEnabled = true;
  const gridSizePx = 40 * gridSize;

  const [noteDisplayData, setNoteDisplayData] = useState(noteData);
  useEffect(() => {
    setNoteDisplayData(noteData);
  }, [noteData]);

  const noteRef = useRef();
  const resizeRef = useRef();
  const move = useGlobalDrag(noteRef);
  const resize = useGlobalDrag(resizeRef);

  const [dragStartData, setDragStartData] = useState(noteData);

  const dragStart = () => {
    setDragStartData(noteData);
  };
  move.onDragStart(dragStart);
  resize.onDragStart(dragStart);

  move.onDragging(({
    oldX, oldY, x, y,
  }) => {
    const newStartTime = dragStartData.tick + (x - oldX) / gridSizePx;
    const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
    let tick = gridSnapEnabled
      ? Number((Math.round((newStartTime) * gridSize) / gridSize).toFixed(numDecimalPlaces))
      : newStartTime;
    tick = Math.max(0, tick);

    let noteNumber = Math.round(
      dragStartData.noteNumber - (y - oldY) / 20,
    );
    noteNumber = Math.min(88, Math.max(1, noteNumber));

    setNoteDisplayData({ ...noteDisplayData, tick, noteNumber });
  });

  move.onDragEnd(() => {
    dispatch(setPatternNoteTick(selectedSample, noteData.id, noteDisplayData.tick));
    dispatch(setPatternNoteNumber(selectedSample, noteData.id, noteDisplayData.noteNumber));
  });

  resize.onDragging(({
    oldX, x,
  }) => {
    const newDuration = dragStartData.duration + (x - oldX) / gridSizePx;
    const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
    let duration = gridSnapEnabled
      ? Number((Math.round((newDuration) * gridSize) / gridSize).toFixed(numDecimalPlaces))
      : newDuration;
    duration = Math.max(0.01, duration);

    setNoteDisplayData({ ...noteDisplayData, duration });
  });

  resize.onDragEnd(() => {
    dispatch(setPatternNoteDuration(selectedSample, noteData.id, noteDisplayData.duration));
  });

  const handleDelete = useCallback((e) => {
    e.preventDefault();
    dispatch(removePatternNote(selectedSample, noteData.id));
  }, [dispatch, noteData.id, selectedSample]);

  const trackIndex = useMemo(() => (
    _.findIndex(tracks, (t) => t.id === selectedTrack)
  ), [selectedTrack, tracks]);

  const wrapperStyle = useMemo(() => ({
    backgroundColor: colours[trackIndex],
    width: Math.max(1, noteDisplayData.duration * (1 / ppq) * 40 - 1),
    left: noteDisplayData.tick * (1 / ppq) * 40 + 1,
    top: (88 - noteDisplayData.noteNumber) * 20 + 12,
  }), [noteDisplayData.duration, noteDisplayData.noteNumber, noteDisplayData.tick, trackIndex]);

  return (
    <div
      className={styles.wrapper}
      style={wrapperStyle}
      ref={noteRef}
      onContextMenu={handleDelete}
    >
      <div
        className={styles.resizeHandle}
        ref={resizeRef}
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