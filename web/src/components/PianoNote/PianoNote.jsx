/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, {
  memo, useMemo, useCallback, useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import Tone from 'tone';
import ReactTooltip from 'react-tooltip';
import styles from './PianoNote.module.scss';
import {
  colours,
} from '../../helpers/constants';
import { useGlobalDrag } from '../../helpers/hooks';
import {
  setPatternNoteTick, setPatternNoteNumber, setPatternNoteDuration, removePatternNote,
} from '../../actions/studioActions';
import playNote from '../../middleware/playNote';
import stopNote from '../../middleware/stopNote';

const ppq = 1;

const PianoNote = memo(({
  noteData, selectedTrack, tracks, dispatch, selectedSample, samples,
}) => {
  const gridSize = 1;
  const gridSnapEnabled = true;
  const gridSizePx = 40 * gridSize;

  const sample = useMemo(() => samples[selectedSample], [samples, selectedSample]);

  const [noteDisplayData, setNoteDisplayData] = useState(noteData);
  useEffect(() => {
    setNoteDisplayData(noteData);
  }, [noteData]);

  const noteRef = useRef();
  const resizeRef = useRef();
  const move = useGlobalDrag(noteRef);
  const resize = useGlobalDrag(resizeRef);

  const [dragStartData, setDragStartData] = useState(noteData);
  const [isDragging, setIsDragging] = useState(false);
  const playingNote = useRef();

  move.onDragStart(() => {
    setDragStartData(noteData);
    setIsDragging(true);
  });
  resize.onDragStart(() => {
    setDragStartData(noteData);
  });

  move.onDragging(({
    oldX, oldY, x, y,
  }) => {
    ReactTooltip.hide();
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
    setIsDragging(false);
    dispatch(setPatternNoteTick(selectedSample, noteData.id, noteDisplayData.tick));
    dispatch(setPatternNoteNumber(selectedSample, noteData.id, noteDisplayData.noteNumber));
    if (playingNote.current) {
      stopNote(playingNote.current);
      playingNote.current = null;
    }
  });

  resize.onDragging(({
    oldX, x,
  }) => {
    ReactTooltip.hide();
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

  useEffect(() => {
    const audioContext = Tone.context.rawContext;
    if (isDragging) {
      if (playingNote.current) {
        stopNote(playingNote.current);
        playingNote.current = null;
      }
      playingNote.current = playNote(
        audioContext,
        { noteNumber: noteDisplayData.noteNumber, velocity: 0.5 },
        audioContext.globalGain,
        audioContext.currentTime,
        0,
        null,
        sample.url,
        sample.patch,
      );
    }
  }, [isDragging, noteData.url, noteDisplayData.noteNumber, sample.patch, sample.url]);

  const handleDelete = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
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
      data-tip="Left click to play, right click to delete"
      data-for="tooltip"
      onMouseOver={() => { ReactTooltip.rebuild(); ReactTooltip.hide(); }}
      onMouseMove={ReactTooltip.rebuild}
      onClick={() => ReactTooltip.hide()}
    >
      <div
        ref={resizeRef}
        onMouseOver={(e) => { e.stopPropagation(); ReactTooltip.hide(); }}
        onMouseMove={(e) => { e.stopPropagation(); ReactTooltip.rebuild(); }}
        data-tip="Hold and move to resize note"
        data-for="tooltip"
        className={styles.resizeHandle}
      />
    </div>
  );
});

PianoNote.propTypes = {
  noteData: PropTypes.object.isRequired,
  selectedTrack: PropTypes.any.isRequired,
  selectedSample: PropTypes.string,
  tracks: PropTypes.arrayOf(PropTypes.object),
  dispatch: PropTypes.func.isRequired,
  samples: PropTypes.object.isRequired,
};

PianoNote.defaultProps = {
  tracks: [],
  selectedSample: '',
};

PianoNote.displayName = 'PianoNote';

const mapStateToProps = ({ studio, studioUndoable }) => ({
  selectedTrack: studio.selectedTrack,
  selectedSample: studio.selectedSample,
  tracks: studioUndoable.present.tracks,
  samples: studioUndoable.present.samples,
});

export default connect(mapStateToProps)(PianoNote);
