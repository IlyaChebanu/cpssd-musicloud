import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Sample.module.scss';
import { connect } from 'react-redux';
import _ from 'lodash';
import { bufferStore } from '../../helpers/constants';
import { lerp } from '../../helpers/utils';
import { setSampleTime, setTrackAtIndex, setSelectedSample, setClipboard } from '../../actions/studioActions';
import { dColours, colours } from '../../helpers/constants';
import { HotKeys } from 'react-hotkeys';

const Sample = memo(props => {

  const buffer = useMemo(() => bufferStore[props.sample.url], [props.sample.url, props.sampleLoading]);

  const waveform = useMemo(() => {
    if (buffer) {
      const data = buffer.getChannelData(0);
      const beatsPerSecond = props.tempo / 60;
      const width = buffer.duration * beatsPerSecond * 40;
      const step = Math.ceil(width / 2);
      const amp = 80;
      const bars = [];
      for (let i = 0; i < step; i++) {
        const d = _.clamp(data[Math.floor(lerp(0, data.length, i / step))], -1, 1);
        bars.push(Math.max(2, Math.abs(Math.floor(d * amp))));
      }
      return <svg className={styles.waveform}>
        {bars.map((bar, i) => <rect key={i} x={(i+1) * 2} y={45 - bar / 2} style={{ height: `${bar}px` }} className={styles.bar}/>)}
      </svg>
    }
  }, [buffer, props.tempo]);

  const wrapperStyle = useMemo(() => {
    const beatsPerSecond = props.tempo / 60;
    const colourIdx = props.sample.track % dColours.length;
    const selected = props.sample.id === props.selectedSample;
    return {
      width: buffer ? buffer.duration * beatsPerSecond * 40 : 20,
      backgroundColor: selected ? colours[colourIdx] : dColours[colourIdx]
    };
  }, [props.tempo, buffer, props.sample.track, props.sample.id, props.selectedSample]);

  const handleDragSample = useCallback(e => {
    props.dispatch(setSelectedSample(props.sample.id));
    const initialMousePos = e.screenX;
    const initialTime = props.sample.time;
    const handleMouseMove = e => {
      e.preventDefault();
      const start = initialTime + (e.screenX - initialMousePos) / 40 / window.devicePixelRatio;
      const numDecimalPlaces = Math.max(0, String(1 / props.gridSize).length - 2);
      const time = props.gridSnapEnabled ? Number((Math.round((start) * props.gridSize) / props.gridSize).toFixed(numDecimalPlaces)) : start;

      // Check for collisions with other samples
      const timeEnd = time + props.sample.duration * (props.tempo / 60);
      for (const sample of props.tracks[props.sample.track].samples) {
        if (sample.id !== props.sample.id) {
          const sampleEndTime = sample.time + sample.duration * (props.tempo / 60);
          if (sample.time < timeEnd && sampleEndTime > time) {
            return;
          }
        }
      }

      props.dispatch(setSampleTime(time, props.sample.id));
    }
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [props.gridSnapEnabled, props.gridSize, props.sample, props.tracks, props.tempo]);

  const deleteSample = useCallback(() => {
    const track = props.tracks[props.sample.track];
    track.samples = track.samples.filter(s => s.id !== props.sample.id);
    props.dispatch(setTrackAtIndex(track, props.sample.track));
  }, [props.tracks, props.sample]);

  const copySample = useCallback(() => {
    props.dispatch(setClipboard(props.sample));
  }, [props.sample]);

  const keyMap = {
    COPY_SAMPLE: "ctrl+c",
    DELETE_SAMPLE: "del",
  };

  const handlers = {
    DELETE_SAMPLE: deleteSample,
    COPY_SAMPLE: copySample
  };

  return (
      <HotKeys
        allowChanges={true}
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
};

const mapStateToProps = ({ studio }) => ({
  sampleLoading: studio.sampleLoading,
  tempo: studio.tempo,
  gridSnapEnabled: studio.gridSnapEnabled,
  gridSize: studio.gridSize,
  tracks: studio.tracks,
  tempo: studio.tempo,
  selectedSample: studio.selectedSample,
});

export default connect(mapStateToProps)(Sample);

