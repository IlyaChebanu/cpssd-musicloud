import React, {
  memo, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Looper.module.scss';
import { setLoop } from '../../actions/studioActions';
import { ReactComponent as Arrow } from '../../assets/icons/arrow-up-light.svg';

const Looper = memo((props) => {
  const {
    loopStart, loopEnd, loopEnabled, gridSnapEnabled, gridSize, gridUnitWidth, dispatch,
  } = props;

  const handleDragLArrow = useCallback((ev) => {
    const mouseStartPos = ev.screenX;
    const initialLoopStart = loopStart;
    const handleMouseMove = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const start = (
        initialLoopStart + (e.screenX - mouseStartPos) / (gridUnitWidth * gridSize)
        / window.devicePixelRatio
      );
      const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
      dispatch(setLoop({
        start: Math.max(1, Math.min(
          loopEnd - 1,
          gridSnapEnabled
            ? (Math.round((start) * gridSize) / gridSize).toFixed(numDecimalPlaces)
            : start,
        )),
        stop: loopEnd,
      }));
    };
    const handleDragStop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [loopStart, gridUnitWidth, gridSize, dispatch, loopEnd, gridSnapEnabled]);

  const handleDragRArrow = useCallback((ev) => {
    const mouseStartPos = ev.screenX;
    const initialLoopEnd = loopEnd;
    const handleMouseMove = (e) => {
      e.stopPropagation();
      const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
      const stop = (
        initialLoopEnd + (e.screenX - mouseStartPos) / (gridUnitWidth * gridSize)
        / window.devicePixelRatio
      );
      dispatch(setLoop({
        start: loopStart,
        stop: Math.max(
          loopStart + 1,
          gridSnapEnabled
            ? (Math.round((stop) * gridSize) / gridSize).toFixed(numDecimalPlaces)
            : stop,
        ),
      }));
    };

    const handleDragStop = (e) => {
      e.stopPropagation();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [loopEnd, gridSize, gridUnitWidth, dispatch, loopStart, gridSnapEnabled]);

  const wrapperStyle = useMemo(() => ({
    transform: `translate(${(loopStart - 1) * (gridUnitWidth * gridSize)}px, 0)`,
    width: `${(loopEnd - loopStart) * (gridUnitWidth * gridSize)}px`,
  }), [loopStart, gridUnitWidth, gridSize, loopEnd]);

  return (
    <div
      data-tip=""
      data-for="tooltip"
      onClick={(e) => { e.stopPropagation(); }}
      onMouseDown={(e) => { e.stopPropagation(); }}
      role="none"
      onWheel={(e) => e.stopPropagation()}
      className={`${styles.wrapper} ${loopEnabled ? styles.loopEnabled : ''}`}
      style={wrapperStyle}
    >
      <div data-place="right" data-tip="Hold and move to set looper start" data-for="tooltip">
        <Arrow
          className={styles.backArrow}
          onMouseDown={handleDragLArrow}
        />
      </div>
      <div data-place="right" data-tip="Hold and move to set looper end" data-for="tooltip">
        <Arrow
          className={styles.frontArrow}
          onMouseDown={handleDragRArrow}
        />
      </div>
    </div>
  );
});

Looper.propTypes = {
  loopStart: PropTypes.number.isRequired,
  loopEnd: PropTypes.number.isRequired,
  loopEnabled: PropTypes.bool.isRequired,
  gridSnapEnabled: PropTypes.bool.isRequired,
  gridSize: PropTypes.number.isRequired,
  gridUnitWidth: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};

Looper.displayName = 'Looper';

const mapStateToProps = ({ studio }) => ({
  loopStart: studio.loop.start,
  loopEnd: studio.loop.stop,
  loopEnabled: studio.loopEnabled,
  gridSnapEnabled: studio.gridSnapEnabled,
  gridSize: studio.gridSize,
  gridUnitWidth: studio.gridUnitWidth,
});

export default connect(mapStateToProps)(Looper);
