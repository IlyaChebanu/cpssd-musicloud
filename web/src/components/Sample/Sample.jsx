import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Sample.module.scss';
import { connect } from 'react-redux';
import _ from 'lodash';
import { bufferStore } from '../../helpers/constants';
import { lerp } from '../../helpers/utils';

const colors = [
  '#C52161',
  '#D66B62',
  '#E7B562',
  '#ACB164',
  '#6FAD66',
  '#62A080',
  '#6790A2',
  '#8D6192'
];

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
        const d = _.clamp(data[lerp(0, buffer.length, i / step)], -1, 1);
        bars.push(Math.max(2, Math.abs(Math.floor(d * amp))));
      }
      return <svg className={styles.waveform}>
        {bars.map((bar, i) => <rect x={(i+1) * 2} y={45 - bar / 2} style={{ height: `${bar}px` }} className={styles.bar}/>)}
      </svg>
    }
  }, [buffer, props.tempo]);

  console.log(props.sample);

  const wrapperStyle = useMemo(() => {
    const beatsPerSeconds = props.tempo / 60;
    return {
      width: buffer ? buffer.duration * beatsPerSeconds * 40 : 20,
      backgroundColor: colors[props.sample.track % colors.length]
    };
  }, [props.tempo, buffer, props.sample.track]);

  return (
    <div className={styles.wrapper} style={wrapperStyle}>
      {waveform}
    </div>
  );
});

Sample.propTypes = {
};

const mapStateToProps = ({ studio }) => ({
  sampleLoading: studio.sampleLoading,
  tempo: studio.tempo,
});

export default connect(mapStateToProps)(Sample);

