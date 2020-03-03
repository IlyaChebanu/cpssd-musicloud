/* eslint-disable react/no-array-index-key */
import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Timeline.module.scss';
import Looper from '../Looper';
import TimelineControls from '../TimelineControls';
import { setCurrentBeat, play, pause } from '../../actions/studioActions';

const Timeline = memo(({
  playing, dispatch, gridSize, gridWidth, scroll,
}) => {
  const ticks = useMemo(() => (
    [...Array(Math.ceil(gridWidth * gridSize) + 1)].map(
      (_, i) => <rect key={i} x={i * 40} y={24} className={styles.tick} />,
    )
  ), [gridSize, gridWidth]);

  const numbers = useMemo(() => (
    [...Array(Math.ceil(gridWidth) + 1)].map(
      (_, i) => (
        <text style={{ pointerEvents: 'none' }} key={i} x={i * (40 * gridSize) + 5} y={24} className={styles.nums}>
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

  const handleDragStart = useCallback((ev) => {
    dispatch(pause);
    const bb = ev.target.getBoundingClientRect();
    const handleMouseMove = (e) => {
      e.preventDefault();
      dispatch(
        setCurrentBeat(
          Math.max(
            1,
            1 + ((e.clientX - bb.left) * window.devicePixelRatio)
             / (40 * window.devicePixelRatio * gridSize),
          ),
        ),
      );
    };
    const handleDragStop = (e) => {
      e.preventDefault();
      dispatch(
        setCurrentBeat(
          Math.max(
            1,
            1 + ((e.clientX - bb.left) * window.devicePixelRatio)
             / (40 * window.devicePixelRatio * gridSize),
          ),
        ),
      );
      // Only plays if the music was playing when handleDragStart was called
      if (playing) {
        dispatch(play);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, gridSize, playing]);

  return (
    <div className={styles.outerWrap}>
      <TimelineControls />
      <div
        role="none"
        onMouseDown={handleDragStart}
        className={styles.wrapper}
        style={wrapperStyle}
      >
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
  playing: PropTypes.bool.isRequired,
  gridSize: PropTypes.number.isRequired,
  scroll: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  gridWidth: PropTypes.number.isRequired,
};

Timeline.displayName = 'Timeline';

const mapStateToProps = ({ studio }) => ({
  gridSize: studio.gridSize,
  scroll: studio.scroll,
  playing: studio.playing,
  gridWidth: studio.gridWidth,
});

export default connect(mapStateToProps)(Timeline);
