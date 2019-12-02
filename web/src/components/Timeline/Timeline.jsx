/* eslint-disable react/no-array-index-key */
import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Timeline.module.scss';
import Looper from '../Looper';
import TimelineControls from '../TimelineControls';

const Timeline = memo(({ gridSize }) => {
  const ticks = useMemo(() => (
    [...Array(1000)].map((_, i) => <rect key={i} x={i * 40} y={24} className={styles.tick} />)
  ), []);

  const numbers = useMemo(() => (
    [...Array(1000)].map((_, i) => (
      <text key={i} x={i * (40 * gridSize) + 5} y={24} className={styles.nums}>{i + 1}</text>
    ))
  ), [gridSize]);

  return (
    <div className={styles.outerWrap}>
      <TimelineControls />
      <div className={styles.wrapper}>
        <svg className={styles.ticks}>
          <rect y={29} className={styles.bottom} />
          {ticks}
          {numbers}
        </svg>
        <Looper />
      </div>
    </div>
  );
});

Timeline.propTypes = {
  gridSize: PropTypes.number.isRequired,
};

Timeline.displayName = 'Timeline';

const mapStateToProps = ({ studio }) => ({
  gridSize: studio.gridSize,
});

export default connect(mapStateToProps)(Timeline);
