/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  memo, useCallback, useMemo, useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { useMouseEvents, useGlobalEvent } from 'beautiful-react-hooks';
import Tone from 'tone';
import styles from './PianoRoll.module.scss';
import { ReactComponent as CloseIcon } from '../../assets/icons/x-icon-10px.svg';
import {
  setShowPianoRoll,
  setSampleName,
  addPatternNote,
} from '../../actions/studioActions';
import PianoNote from '../PianoNote/PianoNote';
import SeekBar from '../SeekBar';
import playNote from '../../middleware/playNote';
import stopNote from '../../middleware/stopNote';
import { showNotification } from '../../actions/notificationsActions';
import { useMidi } from '../../helpers/hooks';

const keyNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

const MIDI = {
  SUSTAIN_PEDAL_CHAN: 64,
  CONTROL: 176,
  KEY_DOWN: 144,
  KEY_UP: 128,
};

const PianoRoll = memo(({
  showPianoRoll, selectedSample, dispatch, samples, currentBeat, recording, loopEnabled, loopEnd, ppq,
}) => {
  const [tracksRef, setTracksRef] = useState();
  const [scroll, setScroll] = useState(0);

  const handleScrollX = useCallback((e) => {
    setScroll(e.target.scrollLeft);
  }, []);

  const handleClose = useCallback((e) => {
    e.preventDefault();
    dispatch(setShowPianoRoll(false));
  }, [dispatch]);


  const gridSize = 4;
  const gridSizePx = 40;

  const selectedSampleObject = useMemo(() => samples[selectedSample], [samples, selectedSample]);
  const notes = useMemo(() => (selectedSampleObject ? selectedSampleObject.notes : {}), [selectedSampleObject]);

  const isSustainPressed = useRef(false);
  const playingNotes = useRef({});
  const pressedNotes = useRef({});
  const { onMidiMessage, onMidiError } = useMidi();

  const commitNote = (key, velocity) => {
    const { recordingStartTime } = playingNotes.current[key];

    let recordingEndTime = currentBeat;
    if (loopEnabled && currentBeat < recordingStartTime) {
      recordingEndTime = loopEnd;
    }

    const beatsDuration = recordingEndTime - recordingStartTime;
    const ticksDuration = beatsDuration / (0.25 / ppq);

    const offsetStartTime = recordingStartTime - selectedSampleObject.time;
    const ticksStartTime = offsetStartTime / (0.25 / ppq);

    const note = {
      noteNumber: Math.min(88, Math.max(1, key)),
      duration: ticksDuration,
      tick: Math.max(0, ticksStartTime),
      velocity,
    };
    dispatch(addPatternNote(selectedSample, note));
  };

  onMidiMessage((message) => {
    const [type, channel, velocity] = message.data;

    if (type === MIDI.CONTROL && channel === MIDI.SUSTAIN_PEDAL_CHAN) {
      isSustainPressed.current = velocity > 0;

      if (!velocity) {
        Object.keys(playingNotes.current).forEach((key) => {
          if (!pressedNotes.current[key]) {
            stopNote(playingNotes.current[key]);
            delete playingNotes.current[key];
          }
        });
      }
    }

    if (!selectedSampleObject) return;

    if (selectedSample) {
      if (type === MIDI.KEY_DOWN) {
        const key = channel - 21;

        const context = Tone.context.rawContext;
        if (playingNotes.current[key]) {
          stopNote(playingNotes.current[key]);

          if (recording) {
            commitNote(key, playingNotes.current[key].velocity);
          }
        }
        playingNotes.current[key] = playNote(
          context,
          { noteNumber: key, velocity: velocity / 256 },
          context.globalGain,
          context.currentTime,
          0,
          null,
          selectedSampleObject.url,
        );
        playingNotes.current[key].velocity = velocity / 256;
        pressedNotes.current[key] = true;

        if (recording) {
          playingNotes.current[key].recordingStartTime = currentBeat;
        }
      }

      if (type === MIDI.KEY_UP) {
        const key = channel - 21;

        if (!isSustainPressed.current) {
          stopNote(playingNotes.current[key]);

          if (recording) {
            commitNote(key, playingNotes.current[key].velocity);
          }

          delete playingNotes.current[key];
        }
        delete pressedNotes.current[key];
      }
    }
  });

  onMidiError((error) => {
    console.error(error);
    dispatch(showNotification({ message: `MIDI error: ${error}` }));
  });

  const keysRef = useRef();
  const playingNote = useRef();
  const [hoveredKey, setHoveredKey] = useState();
  const [isMouseDown, setIsMouseDown] = useState(false);

  const { onMouseDown } = useMouseEvents(keysRef);
  const onMouseUp = useGlobalEvent('mouseup');

  onMouseDown((e) => {
    e.stopPropagation();
    setIsMouseDown(true);
  });

  onMouseUp(() => {
    setIsMouseDown(false);
    if (playingNote.current) {
      stopNote(playingNote.current);
      playingNote.current = null;
    }
  });

  useEffect(() => {
    const audioContext = Tone.context.rawContext;
    if (isMouseDown) {
      if (playingNote.current) {
        stopNote(playingNote.current);
        playingNote.current = null;
      }
      playingNote.current = playNote(
        audioContext,
        { noteNumber: hoveredKey, velocity: 0.5 },
        audioContext.globalGain,
        audioContext.currentTime,
        0,
        null,
        selectedSampleObject.url,
      );
    }
  }, [hoveredKey, isMouseDown, selectedSampleObject]);

  const { pianoKeys, pianoTracks } = useMemo(() => {
    const pianoKeys = [];
    const pianoTracks = [];
    for (let i = 0; i < 88; i += 1) {
      if ([0, 2, 3, 5, 7, 8, 10].includes(i % 12)) {
        pianoKeys.push(
          <button
            className={`${styles.whiteKey} ${isMouseDown && hoveredKey === i + 1 ? styles.active : ''} ${[0, 5, 10].includes(i % 12) ? styles.wide : ''}`}
            key={i}
            onMouseOver={() => setHoveredKey(i + 1)}
          >
            <span className={`${i % 12 === 3 ? styles.bold : styles.light}`}>
              {`${keyNames[i % 12]}${Math.floor(i / 12) + 1}`}
            </span>
          </button>,
        );
        pianoTracks.push(<div className={`${styles.track} ${styles.white}`} key={i} />);
      } else {
        pianoKeys.push(
          <button
            className={`${styles.blackKey} ${isMouseDown && hoveredKey === i + 1 ? styles.active : ''}`}
            key={i}
            onMouseOver={() => setHoveredKey(i + 1)}
          />,
        );
        pianoTracks.push(<div className={`${styles.track} ${styles.black}`} key={i} />);
      }
    }
    return { pianoKeys, pianoTracks };
  }, [hoveredKey, isMouseDown]);


  const numTicks = useMemo(() => {
    if (!tracksRef) return null;
    const bb = tracksRef.getBoundingClientRect();
    const latest = _.maxBy(Object.values(notes), (n) => n.tick + n.duration);
    return Math.ceil(Math.max(bb.width / gridSizePx, latest ? latest.tick + latest.duration : 0)) + 20;
  }, [notes, tracksRef]);

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
      velocity: 1,
    };
    dispatch(addPatternNote(selectedSample, note));
  }, [dispatch, selectedSample]);

  const handleChange = useCallback((e) => {
    dispatch(setSampleName(e.target.value, selectedSample));
  }, [dispatch, selectedSample]);

  const renderableNotes = useMemo(() => {
    if (selectedSampleObject && selectedSampleObject.notes) {
      return Object.entries(selectedSampleObject.notes).map(([id, note]) => (
        <PianoNote noteData={{ ...note, id }} />
      ));
    }
    return null;
  }, [selectedSampleObject]);

  if (!showPianoRoll) return null;
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
                <SeekBar currentBeat={selectedSampleObject ? (currentBeat - selectedSampleObject.time + 1) : 0} scaleFactor={gridSize} scrollPosition={scroll} />
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
          <div className={styles.keys} ref={keysRef}>
            {pianoKeys}
          </div>
          <div className={styles.keyTracks} onMouseDown={handleCreateNote} ref={(ref) => setTracksRef(ref)} onScroll={handleScrollX}>
            {pianoTracks}
            <div className={styles.tickDividersWrapper}>
              {tickDividers}
            </div>
            <div className={styles.notes}>
              {renderableNotes}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PianoRoll.propTypes = {
  currentBeat: PropTypes.number.isRequired,
  showPianoRoll: PropTypes.bool.isRequired,
  selectedSample: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  samples: PropTypes.object.isRequired,
  recording: PropTypes.bool.isRequired,
  loopEnabled: PropTypes.bool.isRequired,
  loopEnd: PropTypes.number.isRequired,
  ppq: PropTypes.number.isRequired,
};

PianoRoll.defaultProps = {
  selectedSample: '',
};

PianoRoll.displayName = 'PianoRoll';

const mapStateToProps = ({ studio }) => ({
  currentBeat: studio.currentBeat,
  showPianoRoll: studio.showPianoRoll,
  selectedSample: studio.selectedSample,
  samples: studio.samples,
  recording: studio.recording,
  loopEnabled: studio.loopEnabled,
  loopEnd: studio.loop.stop,
  ppq: studio.ppq,
});

export default connect(mapStateToProps)(PianoRoll);
