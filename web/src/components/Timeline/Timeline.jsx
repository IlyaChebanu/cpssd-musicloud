/* eslint-disable react/no-array-index-key */
import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Timeline.module.scss';
import Looper from '../Looper';
import TimelineControls from '../TimelineControls';

const Timeline = memo(({ gridSize, gridWidth, scroll }) => {
  const ticks = useMemo(() => (
    [...Array(Math.ceil(gridWidth * gridSize) + 1)].map(
      (_, i) => <rect key={i} x={i * 40} y={24} className={styles.tick} />,
    )
  ), [gridSize, gridWidth]);

  const numbers = useMemo(() => (
    [...Array(Math.ceil(gridWidth) + 1)].map(
      (_, i) => (
        <text key={i} x={i * (40 * gridSize) + 5} y={24} className={styles.nums}>
          {i + 1}
        </text>
      ),
    )
  ), [gridSize, gridWidth]);

  const widthStyle = useMemo(() => ({
    width: Math.ceil(gridWidth * gridSize) * 40 + 10,
  }), [gridSize, gridWidth]);

  const wrapperStyle = useMemo(() => ({
    transform: `translateX(${-scroll}px)`,
    ...widthStyle,
  }), [scroll, widthStyle]);

  return (
    <div className={styles.outerWrap}>
      <TimelineControls />
      <div className={styles.wrapper} style={wrapperStyle}>
        <svg className={styles.ticks} style={widthStyle}>
          <rect
            y={29}
            className={styles.bottom}
            style={widthStyle}
          />
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
  scroll: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
};

Timeline.displayName = 'Timeline';

const mapStateToProps = ({ studio }) => ({
  gridSize: studio.gridSize,
  scroll: studio.scroll,
  gridWidth: studio.gridWidth,
});

export default connect(mapStateToProps)(Timeline);
