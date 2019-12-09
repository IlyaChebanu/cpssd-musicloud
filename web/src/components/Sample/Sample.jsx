/* eslint-disable react/no-array-index-key */
import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { HotKeys } from 'react-hotkeys';
import styles from './Sample.module.scss';
import { bufferStore, dColours, colours } from '../../helpers/constants';
import { lerp } from '../../helpers/utils';
import {
  setSampleTime, setTrackAtIndex, setSelectedSample, setClipboard,
} from '../../actions/studioActions';


const Sample = memo((props) => {
  const {
    sample, tempo, selectedSample, dispatch, gridSnapEnabled, gridSize, tracks,
  } = props;

  const buffer = useMemo(() => bufferStore[sample.url], [sample.url]);

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
    return {
      width: buffer ? buffer.duration * beatsPerSecond * (40 * gridSize) : 20,
      backgroundColor: selected ? colours[colourIdx] : dColours[colourIdx],
      zIndex: selected ? 2 : 1,
    };
  }, [tempo, sample.track, sample.id, selectedSample, buffer, gridSize]);

  const handleDragSample = useCallback((ev) => {
    dispatch(setSelectedSample(props.sample.id));
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

  return (
    <HotKeys
      allowChanges
      keyMap={keyMap}
      handlers={handlers}
      className={styles.wrapper}
      style={{ ...wrapperStyle, ...props.style }}
      onMouseDown={handleDragSample}
    >
      {waveform}
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
});

export default connect(mapStateToProps)(Sample);
