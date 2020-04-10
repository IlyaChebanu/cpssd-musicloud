/* eslint-disable react/no-array-index-key */
import React, {
  memo, useMemo, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GlobalHotKeys } from 'react-hotkeys';
import styles from './Timeline.module.scss';
import Looper from '../Looper';
import TimelineControls from '../TimelineControls';
import {
  setCurrentBeat, play, pause, setDraggingSeekBar, setGridUnitWidth, setGridSize,
} from '../../actions/studioActions';

const Timeline = memo(({
  playing, dispatch, gridSize, gridWidth, minGridUnitWidth, maxGridUnitWidth, gridUnitWidth, scroll,
}) => {
  const ref = useRef();
  const ticks = useMemo(() => (
    [...Array(Math.ceil(gridWidth * gridSize) + 1)].map(
      (_, i) => <rect style={{ pointerEvents: 'none' }} key={i} x={i * gridUnitWidth} y={24} className={styles.tick} />,
    )
  ), [gridSize, gridUnitWidth, gridWidth]);

  const numbers = useMemo(() => (
    [...Array(Math.ceil(gridWidth) + 1)].map(
      (_, i) => (
        <text style={{ pointerEvents: 'none' }} key={i} x={i * (gridUnitWidth * gridSize) + 5} y={24} className={styles.nums}>
          {i + 1}
        </text>
      ),
    )
  ), [gridSize, gridUnitWidth, gridWidth]);

  const widthStyle = useMemo(() => ({
    width: Math.ceil(gridWidth * gridSize) * gridUnitWidth + 10,
  }), [gridSize, gridUnitWidth, gridWidth]);

  const wrapperStyle = useMemo(() => ({
    transform: `translateX(${-scroll}px)`,
    ...widthStyle,
  }), [scroll, widthStyle]);

  const handleWheelUp = useCallback(() => {
    if (gridUnitWidth === maxGridUnitWidth) {
      if (gridSize !== 16) {
        dispatch(setGridSize(gridSize * 2));
        dispatch(setGridUnitWidth(minGridUnitWidth + 10));
      }
      return;
    }
    dispatch(setGridUnitWidth(gridUnitWidth + 10));
  }, [dispatch, gridSize, gridUnitWidth, maxGridUnitWidth, minGridUnitWidth]);

  const handleWheelDown = useCallback(() => {
    if (gridUnitWidth === minGridUnitWidth) {
      if (gridSize !== 1) {
        dispatch(setGridSize(gridSize / 2));
        dispatch(setGridUnitWidth(maxGridUnitWidth - 10));
      }
      return;
    }
    dispatch(setGridUnitWidth(gridUnitWidth - 10));
  }, [dispatch, gridSize, gridUnitWidth, maxGridUnitWidth, minGridUnitWidth]);

  const handleResizeGrid = (ev) => {
    if (ev.deltaY < 0) {
      handleWheelUp();
    } else {
      handleWheelDown();
    }
  };

  const handleDragStart = useCallback((ev) => {
    dispatch(setDraggingSeekBar(true));
    dispatch(pause);
    const bb = ev.target.getBoundingClientRect();
    const handleMouseMove = (e) => {
      e.preventDefault();
      dispatch(
        setCurrentBeat(
          Math.max(
            1,
            1 + ((e.clientX - bb.left) * window.devicePixelRatio)
             / (gridUnitWidth * window.devicePixelRatio * gridSize),
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
             / (gridUnitWidth * window.devicePixelRatio * gridSize),
          ),
        ),
      );
      // Only plays if the music was playing when handleDragStart was called
      if (playing) {
        dispatch(play);
      }
      dispatch(setDraggingSeekBar(false));
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, gridSize, gridUnitWidth, playing]);

  const keyMap = {
    WHEEL_UP: '+',
    WHEEL_DOWN: '-',
    CTRL_WHEEL_UP: 'ctrl++',
    CTRL_WHEEL_DOWN: 'ctrl+-',
  };

  const handlers = {
    WHEEL_UP: handleWheelUp,
    WHEEL_DOWN: handleWheelDown,
    CTRL_WHEEL_UP: (e) => { e.stopPropagation(); },
    CTRL_WHEEL_DOWN: (e) => { e.stopPropagation(); },
  };


  return (
    <GlobalHotKeys
      allowChanges
      keyMap={keyMap}
      handlers={handlers}
      className={styles.wrapper}
      innerRef={ref}
    >
      <div
        className={styles.outerWrap}
        role="none"
        onWheel={handleResizeGrid}
        onMouseDown={handleDragStart}
      >
        <TimelineControls />
        <div

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
    </GlobalHotKeys>
  );
});

Timeline.propTypes = {
  playing: PropTypes.bool.isRequired,
  gridSize: PropTypes.number.isRequired,
  scroll: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  gridWidth: PropTypes.number.isRequired,
  gridUnitWidth: PropTypes.number.isRequired,
  minGridUnitWidth: PropTypes.isRequired,
  maxGridUnitWidth: PropTypes.isRequired,
};

Timeline.displayName = 'Timeline';

const mapStateToProps = ({ studio }) => ({
  gridSize: studio.gridSize,
  scroll: studio.scroll,
  playing: studio.playing,
  gridWidth: studio.gridWidth,
  minGridUnitWidth: studio.minGridUnitWidth,
  maxGridUnitWidth: studio.maxGridUnitWidth,
  gridUnitWidth: studio.gridUnitWidth,
});

export default connect(mapStateToProps)(Timeline);
