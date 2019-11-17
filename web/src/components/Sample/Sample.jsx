import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Sample.module.scss';
import { connect } from 'react-redux';
import _ from 'lodash';
import { bufferStore } from '../../helpers/constants';
import { lerp } from '../../helpers/utils';
import store from '../../store';
import { setSampleTime, setTrackAtIndex } from '../../actions/studioActions';
import { dColours } from '../../helpers/constants';
import { HotKeys } from 'react-hotkeys';

const Sample = memo(props => {

  const buffer = useMemo(() => bufferStore[props.sample.url], [props.sample.url, props.sampleLoading]);

  const waveform = useMemo(() => {
    if (buffer) {
      const data = buffer.getChannelData(0);
      const beatsPerSeconds = props.tempo / 60;
      const width = buffer.duration * beatsPerSeconds * 40;
      const step = Math.ceil(width / 2);
      const amp = 80;
      const bars = [];
      for (let i = 0; i < step; i++) {
        const d = _.clamp(data[Math.floor(lerp(0, data.length, i / step))], -1, 1);
        bars.push(Math.max(2, Math.abs(Math.floor(d * amp))));
      }
      return <svg className={styles.waveform}>
        {bars.map((bar, i) => <rect x={(i+1) * 2} y={45 - bar / 2} style={{ height: `${bar}px` }} className={styles.bar}/>)}
      </svg>
    }
  }, [buffer, props.tempo]);

  const wrapperStyle = useMemo(() => {
    const beatsPerSeconds = props.tempo / 60;
    return {
      width: buffer ? buffer.duration * beatsPerSeconds * 40 : 20,
      backgroundColor: dColours[props.sample.track % dColours.length]
    };
  }, [props.tempo, buffer, props.sample.track]);

  const handleDragSample = useCallback(e => {
    const mousePosOffset = e.screenX - 220 - (props.sample.time - 1) * 40;
    const handleMouseMove = e => {
      e.preventDefault();
      const scroll = store.getState().studio.scroll;
      const start = (scroll + e.screenX - 220 - mousePosOffset) / 40 + 1;
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
    console.log(props.sample.id);
    track.samples = track.samples.filter(s => s.id !== props.sample.id);
    props.dispatch(setTrackAtIndex(track, props.sample.track));
  }, [props.tracks, props.sample]);

  const handlers = useMemo(() => ({
    DELETE_SAMPLE: deleteSample
  }), []);

  return (
      <HotKeys handlers={handlers} className={styles.wrapper} style={{ ...wrapperStyle, ...props.style }} onMouseDown={handleDragSample}>
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
  tempo: studio.tempo
});

export default connect(mapStateToProps)(Sample);

