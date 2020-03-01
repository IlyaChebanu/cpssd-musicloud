/* eslint-disable react/no-array-index-key */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  memo, useCallback, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import styles from './PianoRoll.module.scss';
import { ReactComponent as CloseIcon } from '../../assets/icons/x-icon-10px.svg';
import {
  setShowPianoRoll,
  // setTrackAtIndex,
  setSampleName,
  addPatternNote,
} from '../../actions/studioActions';
import PianoNote from '../PianoNote/PianoNote';

const pianoKeys = [];
const pianoTracks = [];
for (let i = 0; i < 88; i += 1) {
  if ([0, 2, 3, 5, 7, 8, 10].includes(i % 12)) {
    pianoKeys.push(<button className={`${styles.whiteKey} ${[0, 5, 10].includes(i % 12) ? styles.wide : ''}`} key={i} />);
    pianoTracks.push(<div className={`${styles.track} ${styles.white}`} key={i} />);
  } else {
    pianoKeys.push(<button className={styles.blackKey} key={i} />);
    pianoTracks.push(<div className={`${styles.track} ${styles.black}`} key={i} />);
  }
}


const PianoRoll = memo(({
  showPianoRoll, selectedSample, tracks, selectedTrack, dispatch, samples,
}) => {
  if (!showPianoRoll) return null;

  const [tracksRef, setTracksRef] = useState();
  const [scroll, setScroll] = useState(0);

  const handleScrollX = useCallback((e) => {
    setScroll(e.target.scrollLeft);
  }, []);

  const handleClose = useCallback(() => {
    dispatch(setShowPianoRoll(false));
  }, [dispatch]);

  const gridSize = 4;
  const gridSizePx = 40;

  const selectedSampleObject = useMemo(() => samples[selectedSample], [samples, selectedSample]);

  const numTicks = useMemo(() => {
    if (!tracksRef) return null;
    const bb = tracksRef.getBoundingClientRect();
    const latest = selectedSampleObject && _.maxBy(selectedSampleObject.notes, (n) => n.tick + n.duration);
    return Math.ceil(Math.max(bb.width / gridSizePx, latest ? latest.tick + latest.duration : 0));
  }, [selectedSampleObject, tracksRef]);

  const ticks = useMemo(() => (
    [...Array(numTicks)].map(
      (_, i) => <rect key={i} x={i * 40} y={14} className={styles.tick} />,
    )
  ), [numTicks]);

  const numbers = useMemo(() => (
    [...Array(Math.ceil(numTicks / gridSize) + 1)].map(
      (_, i) => (
        <text key={i} x={i * (40 * gridSize) + 5} y={14} className={styles.nums}>
          {i + 1}
        </text>
      ),
    )
  ), [numTicks]);

  const widthStyle = useMemo(() => ({
    width: numTicks * gridSizePx,
  }), [numTicks]);

  const wrapperStyle = useMemo(() => ({
    transform: `translateX(${-scroll}px)`,
    ...widthStyle,
  }), [scroll, widthStyle]);

  const tickDividers = useMemo(() => [...Array(numTicks)].map(
    (_, i) => <div className={styles.tickDividers} key={i} style={{ left: i * gridSizePx }} />,
  ), [numTicks]);

  const handleCreateNote = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const bb = e.target.getBoundingClientRect();
    const noteNumber = 88 - Math.floor(
      ((e.clientY - bb.top - 10 - (e.target.scrollTop / window.devicePixelRatio)) / 20),
    );
    const tick = Math.floor((e.clientX - bb.left + (e.target.scrollLeft / window.devicePixelRatio)) / 40);

    const note = {
      noteNumber: Math.min(88, Math.max(1, noteNumber)),
      duration: 2,
      tick: Math.max(0, tick),
      velocity: 100,
    };
    dispatch(addPatternNote(selectedSample, note));
  }, [dispatch, selectedSample]);

  const handleChange = useCallback((e) => {
    dispatch(setSampleName(e.target.value, selectedSample));
  }, [dispatch, selectedSample]);

  return (
    <div
      className={styles.background}
    >
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.controls}>
            <div className={styles.left}>
              <div />
            </div>
            <div className={styles.right}>
              <div className={styles.upper}>
                <div>
                  <span className={styles.sampleName}>
                    <input
                      value={selectedSampleObject && selectedSampleObject.name}
                      onChange={handleChange}
                    />
                  </span>
                </div>
                <CloseIcon onClick={handleClose} />
              </div>
              <div className={styles.lower}>
                <div className={styles.timelineWrapper} style={wrapperStyle}>
                  <svg className={styles.ticks} style={widthStyle}>
                    <rect
                      y={19}
                      className={styles.bottom}
                      style={widthStyle}
                    />
                    {ticks}
                    {numbers}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.keyboard}>
          <div className={styles.keys}>
            {pianoKeys}
          </div>
          <div className={styles.keyTracks} onMouseDown={handleCreateNote} ref={(ref) => setTracksRef(ref)} onScroll={handleScrollX}>
            {pianoTracks}
            <div className={styles.tickDividersWrapper}>
              {tickDividers}
            </div>
            <div className={styles.notes}>
              {selectedSampleObject && selectedSampleObject.notes && Object.entries(selectedSampleObject.notes).map(([id, note]) => (
                <PianoNote noteData={{ ...note, id }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PianoRoll.propTypes = {
  showPianoRoll: PropTypes.bool.isRequired,
  selectedSample: PropTypes.string,
  tracks: PropTypes.arrayOf(PropTypes.object),
  selectedTrack: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  samples: PropTypes.object.isRequired,
};

PianoRoll.defaultProps = {
  selectedSample: '',
  tracks: [],
  selectedTrack: -1,
};

PianoRoll.displayName = 'PianoRoll';

const mapStateToProps = ({ studio }) => ({
  showPianoRoll: studio.showPianoRoll,
  selectedSample: studio.selectedSample,
  tracks: studio.tracks,
  selectedTrack: studio.selectedTrack,
  samples: studio.samples,
});

export default connect(mapStateToProps)(PianoRoll);
