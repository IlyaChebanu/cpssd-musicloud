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
import { colours, audioContext } from '../../helpers/constants';
import { useGlobalDrag } from '../../helpers/hooks';
import {
  setPatternNoteTick, setPatternNoteNumber, setPatternNoteDuration, removePatternNote,
} from '../../actions/studioActions';
import playNote from '../../middleware/playNote';

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
  const popFilter = useMemo(() => {
    const popFilter = audioContext.createGain();
    popFilter.connect(audioContext.globalGain);
    popFilter.gain.setValueAtTime(0, 0);
    return popFilter;
  }, []);

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
    setIsDragging(false);
    if (playingNote.current) {
      popFilter.gain.setValueAtTime(popFilter.gain.value, 0);
      popFilter.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.01);
      if (sample.url) {
        playingNote.current.stop(audioContext.currentTime + 0.01);
      } else {
        playingNote.current.triggerRelease('+0.01');
      }
    }
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

  useEffect(() => {
    if (isDragging) {
      if (playingNote.current) {
        popFilter.gain.setValueAtTime(popFilter.gain.value, 0);
        popFilter.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.01);
        if (sample.url) {
          playingNote.current.stop(audioContext.currentTime + 0.01);
        } else {
          playingNote.current.triggerRelease('+0.01');
        }
      }
      popFilter.gain.setValueAtTime(popFilter.gain.value, audioContext.currentTime + 0.01);
      popFilter.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 0.02);
      playingNote.current = playNote(
        audioContext,
        { noteNumber: noteDisplayData.noteNumber },
        popFilter,
        sample.url ? audioContext.currentTime + 0.01 : audioContext.currentTime,
        0,
        null,
        sample.url,
      );
    }
  }, [isDragging, noteData.url, noteDisplayData.noteNumber, popFilter, sample.url]);

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
  samples: PropTypes.object.isRequired,
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
  samples: studio.samples,
});

export default connect(mapStateToProps)(PianoNote);
