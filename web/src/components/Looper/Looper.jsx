import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Looper.module.scss';
import { setLoop } from '../../actions/studioActions';
import { ReactComponent as Arrow } from '../../assets/icons/arrow-up-light.svg';


const Looper = memo((props) => {
  const {
    loopStart, loopEnd, loopEnabled, gridSnapEnabled, gridSize, dispatch,
  } = props;

  const handleDragLArrow = useCallback((ev) => {
    const mouseStartPos = ev.screenX;
    const initialLoopStart = loopStart;
    const handleMouseMove = (e) => {
      e.preventDefault();
      const start = initialLoopStart + (e.screenX - mouseStartPos) / (40 * gridSize) / window.devicePixelRatio;
      const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
      dispatch(setLoop({
        start: Math.min(
          loopEnd - 1,
          gridSnapEnabled
            ? (Math.round((start) * gridSize) / gridSize).toFixed(numDecimalPlaces)
            : start,
        ),
        stop: loopEnd,
      }));
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [loopStart, gridSize, dispatch, loopEnd, gridSnapEnabled]);

  const handleDragRArrow = useCallback((ev) => {
    const mouseStartPos = ev.screenX;
    const initialLoopEnd = loopEnd;
    const handleMouseMove = (e) => {
      e.preventDefault();
      const stop = initialLoopEnd + (e.screenX - mouseStartPos) / (40 * gridSize) / window.devicePixelRatio;
      const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
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
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [loopEnd, gridSize, dispatch, loopStart, gridSnapEnabled]);

  const wrapperStyle = useMemo(() => ({
    transform: `translate(${(loopStart - 1) * (40 * gridSize)}px, 0)`,
    width: `${(loopEnd - loopStart) * (40 * gridSize)}px`,
  }), [loopStart, gridSize, loopEnd]);

  return (
    <div className={`${styles.wrapper} ${loopEnabled ? styles.loopEnabled : ''}`} style={wrapperStyle}>
      <Arrow onMouseDown={handleDragLArrow} />
      <Arrow onMouseDown={handleDragRArrow} />
    </div>
  );
});

Looper.propTypes = {
  loopStart: PropTypes.number.isRequired,
  loopEnd: PropTypes.number.isRequired,
  loopEnabled: PropTypes.bool.isRequired,
  gridSnapEnabled: PropTypes.bool.isRequired,
  gridSize: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};

Looper.displayName = 'Looper';

const mapStateToProps = ({ studio }) => ({
  loopStart: studio.loop.start,
  loopEnd: studio.loop.stop,
  loopEnabled: studio.loopEnabled,
  gridSnapEnabled: studio.gridSnapEnabled,
  gridSize: studio.gridSize,
});

export default connect(mapStateToProps)(Looper);
