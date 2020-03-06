/* eslint-disable react/no-array-index-key */
import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { HotKeys } from 'react-hotkeys';
import styles from './Sample.module.scss';
import { dColours, colours } from '../../helpers/constants';
import { lerp } from '../../helpers/utils';
import {
  setSampleTime, setTrackAtIndex, setSelectedSample, setClipboard,
  hideSampleEffects, showSampleEffects, setShowPianoRoll,
} from '../../actions/studioActions';

import editIcon from '../../assets/icons/edit-sample.svg';


const Sample = memo((props) => {
  const {
    sample, tempo, selectedSample, dispatch, gridSnapEnabled, gridSize, tracks,
    sampleEffectsHidden, showPianoRoll,
  } = props;

  const buffer = useMemo(() => sample.buffer, [sample.buffer]);

  const waveform = useMemo(() => {
    if (buffer) {
      const data = buffer.getChannelData(0);
      const beatsPerSecond = tempo / 60;
      const width = buffer.duration * beatsPerSecond * (40 * gridSize);
      const step = Math.ceil(width / 2);
      const amp = 80;
      const bars = [];
      for (let i = 0; i < step; i += 1) {
        const d = _.clamp(data[Math.floor(lerp(0, data.length, i / step))], -1, 1);
        bars.push(Math.max(2, Math.abs(Math.floor(d * amp))));
      }
      return (
        <svg className={styles.waveform}>
          {bars.map((bar, i) => (
            <rect
              key={i}
              x={(i + 1) * 2}
              y={45 - bar / 2}
              style={{ height: `${bar}px` }}
              className={styles.bar}
            />
          ))}
        </svg>
      );
    }
    return null;
  }, [buffer, gridSize, tempo]);

  const wrapperStyle = useMemo(() => {
    const beatsPerSecond = tempo / 60;
    const colourIdx = sample.track % dColours.length;
    const selected = sample.id === selectedSample;
    const ppq = 1;
    let width;
    if (sample.type === 'pattern') {
      const latest = _.maxBy(sample.notes, (n) => n.tick + n.duration);
      width = (0.25 / ppq) * (latest ? latest.tick + latest.duration : 4 * ppq) * (40 * gridSize);
    } else {
      width = buffer ? buffer.duration * beatsPerSecond * (40 * gridSize) : 20;
    }
    return {
      width,
      backgroundColor: selected ? colours[colourIdx] : dColours[colourIdx],
      zIndex: selected ? 2 : 1,
    };
  }, [tempo, sample.track, sample.id, sample.type, sample.notes, selectedSample, gridSize, buffer]);

  const handleDragSample = useCallback((ev) => {
    dispatch(setSelectedSample(props.sample.id || ''));
    const initialMousePos = ev.screenX;
    const initialTime = props.sample.time;
    const handleMouseMove = (e) => {
      e.preventDefault();
      const start = (
        initialTime + (e.screenX - initialMousePos) / (40 * gridSize) / window.devicePixelRatio
      );
      const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
      const time = gridSnapEnabled
        ? Number((Math.round((start) * gridSize) / gridSize).toFixed(numDecimalPlaces))
        : start;

      dispatch(setSampleTime(time, sample.id));
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, gridSize, gridSnapEnabled, props.sample.id, props.sample.time, sample.id]);

  const deleteSample = useCallback(() => {
    const track = tracks[sample.track];
    track.samples = track.samples.filter((s) => s.id !== sample.id);
    dispatch(setTrackAtIndex(track, props.sample.track));
  }, [dispatch, props.sample.track, sample.id, sample.track, tracks]);

  const copySample = useCallback(() => {
    dispatch(setClipboard(sample));
  }, [dispatch, sample]);

  const keyMap = {
    COPY_SAMPLE: 'ctrl+c',
    DELETE_SAMPLE: 'del',
  };

  const handlers = {
    DELETE_SAMPLE: deleteSample,
    COPY_SAMPLE: copySample,
  };

  const handleShowHideSampleEffects = useCallback((e) => {
    e.preventDefault();
    if (sampleEffectsHidden) {
      dispatch(showSampleEffects());
    } else {
      dispatch(hideSampleEffects());
    }
  }, [dispatch, sampleEffectsHidden]);

  const handleTogglePiano = useCallback((e) => {
    e.preventDefault();
    dispatch(setShowPianoRoll(!showPianoRoll));
  }, [dispatch, showPianoRoll]);


  return (
    <HotKeys
      allowChanges
      keyMap={keyMap}
      handlers={handlers}
      className={styles.wrapper}
      style={{ ...wrapperStyle, ...props.style }}
      onMouseDown={handleDragSample}
    >
      <p>{sample.id === selectedSample ? props.sample.name : ''}</p>
      {sample.id === selectedSample
        ? (
          <img
            onClick={sample.type === 'pattern' ? handleTogglePiano : handleShowHideSampleEffects}
            className={sampleEffectsHidden ? styles.edit : `${styles.editing} ${styles.edit}`}
            src={editIcon}
            alt="edit sample icon"
          />
        ) : ''}
      {sample.type === 'pattern' ? '' : waveform}
      <div className={styles.fadeWrapper}>
        {sample.id === selectedSample && !!(sample.fade.fadeIn || sample.fade.fadeOut) && (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" fill="rgba(0, 0, 0, 0.3)">
            <path d={`M 0 0 L ${sample.fade.fadeIn * 100} 0 L 0 100`} />
            <path d={`M ${(1 - sample.fade.fadeOut) * 100} 0 L 100 0 L 100 100`} />
          </svg>
        )}
      </div>
    </HotKeys>
  );
});

Sample.propTypes = {
  style: PropTypes.object,
  sample: PropTypes.object.isRequired,
  tempo: PropTypes.number.isRequired,
  selectedSample: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  gridSnapEnabled: PropTypes.bool.isRequired,
  gridSize: PropTypes.number.isRequired,
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
  sampleEffectsHidden: PropTypes.bool.isRequired,
  showPianoRoll: PropTypes.bool.isRequired,
};

Sample.defaultProps = {
  style: {},
};

Sample.displayName = 'Sample';

const mapStateToProps = ({ studio }) => ({
  sampleLoading: studio.sampleLoading,
  tempo: studio.tempo,
  gridSnapEnabled: studio.gridSnapEnabled,
  gridSize: studio.gridSize,
  selectedSample: studio.selectedSample,
  tracks: studio.tracks,
  sampleEffectsHidden: studio.sampleEffectsHidden,
  showPianoRoll: studio.showPianoRoll,
});

export default connect(mapStateToProps)(Sample);
