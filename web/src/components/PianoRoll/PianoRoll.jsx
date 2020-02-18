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
import { setShowPianoRoll, setTrackAtIndex, setSampleName } from '../../actions/studioActions';
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
  showPianoRoll, selectedSample, tracks, selectedTrack, dispatch,
}) => {
  if (!showPianoRoll) return null;

  const handleClose = useCallback(() => {
    dispatch(setShowPianoRoll(false));
  }, [dispatch]);

  // const keyNotes = useMemo(() => {
  //   if (selectedTrack !== -1 && selectedSample) {
  //     const sampleObj = _.find(tracks[selectedTrack].samples, (s) => s.id === selectedSample);
  //     const notes = sampleObj.notes.map((n, i) => ({ ...n, idx: i }));
  //     return _.groupBy(notes, (n) => n.noteNumber);
  //   }
  //   return {};

  //   const trackArray = [];
  //   for (let i = 0; i < 88; i += 1) {
  //     trackArray.push(
  //       <div
  //         className={`${styles.track} ${[0, 2, 3, 5, 7, 8, 10].includes(i % 12) ? styles.white : styles.black}`}
  //         key={i}
  //       >
  //         {keyNotes[i + 1] && keyNotes[i + 1].map((note) => <PianoNote noteData={note} />)}
  //       </div>,
  //     );
  //   }
  //   return trackArray;
  // }, [selectedSample, selectedTrack, tracks]);

  const gridWidth = 40;
  const gridSize = 4;
  const scroll = 0;

  const ticks = useMemo(() => (
    [...Array(Math.ceil(gridWidth * gridSize) + 1)].map(
      (_, i) => <rect key={i} x={i * 40} y={14} className={styles.tick} />,
    )
  ), []);

  const numbers = useMemo(() => (
    [...Array(Math.ceil(gridWidth) + 1)].map(
      (_, i) => (
        <text key={i} x={i * (40 * gridSize) + 5} y={14} className={styles.nums}>
          {i + 1}
        </text>
      ),
    )
  ), []);

  const tickDividers = useMemo(() => (
    [...Array(Math.ceil(gridWidth * gridSize) + 1)].map(
      (_, i) => <div className={styles.tickDividers} key={i} style={{ left: i * 40 }} />,
    )
  ), []);

  const widthStyle = useMemo(() => ({
    width: Math.ceil(gridWidth * gridSize) * 40,
  }), []);

  const wrapperStyle = useMemo(() => ({
    transform: `translateX(${-scroll}px)`,
    ...widthStyle,
  }), [widthStyle]);

  const selectedSampleObject = useMemo(() => {
    let found;
    if (selectedTrack !== -1 && selectedSample) {
      found = _.find(tracks[selectedTrack].samples, (s) => s.id === selectedSample);
    }
    if (!found || (found && !found.notes)) {
      handleClose();
      return {};
    }
    return found;
  }, [handleClose, selectedSample, selectedTrack, tracks]);

  const handleCreateNote = useCallback((e) => {
    e.preventDefault();
    const bb = e.target.getBoundingClientRect();
    const sampleIndex = _.findIndex(tracks[selectedTrack].samples, (s) => s.id === selectedSample);
    const noteNumber = 88 - Math.floor(
      (e.screenY / window.devicePixelRatio - bb.top - 110 / window.devicePixelRatio) / 20,
    );
    if (noteNumber > 88) return;
    const tick = Math.floor((e.screenX / window.devicePixelRatio - bb.left) / 40);

    const note = {
      noteNumber,
      duration: 2,
      tick,
      velocity: 100,
    };
    const track = { ...tracks[selectedTrack] };
    track.samples[sampleIndex].notes.push(note);
    dispatch(setTrackAtIndex(track, selectedTrack));
  }, [dispatch, selectedSample, selectedTrack, tracks]);

  const [nameInput, setNameInput] = useState(selectedSampleObject.name || '');

  const handleSetSampleName = useCallback(async () => {
    dispatch(setSampleName(nameInput));
  }, [dispatch, nameInput]);

  const handleChange = useCallback((e) => {
    setNameInput(e.target.value);
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
                      value={nameInput}
                      onBlur={handleSetSampleName}
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
          <div className={styles.keyTracks} onMouseDown={handleCreateNote}>
            {pianoTracks}
            <div className={styles.tickDividersWrapper}>
              {tickDividers}
            </div>
            <div className={styles.notes}>
              {selectedSampleObject.notes && selectedSampleObject.notes.map((note, i) => (
                <PianoNote noteData={{ ...note, idx: i }} />
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
});

export default connect(mapStateToProps)(PianoRoll);
