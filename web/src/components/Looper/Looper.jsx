import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Looper.module.scss';
import { connect } from 'react-redux';
import { setLoop } from '../../actions/studioActions';
import store from '../../store';
import { ReactComponent as Arrow } from '../../assets/icons/arrow-up-light.svg';


const Looper = memo(props => {
  const { loopStart, loopEnd, loopEnabled, gridSnapEnabled, gridSize, dispatch } = props;

  const handleDragLArrow = useCallback(() => {
    const handleMouseMove = e => {
      const scroll = store.getState().studio.scroll;
      const start = (scroll + e.screenX - 220) / 40 + 1;
      const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
      dispatch(setLoop({
        start: Math.max(
          1,
          gridSnapEnabled ? (Math.round((start) * gridSize) / gridSize).toFixed(numDecimalPlaces) : start
        ),
        stop: loopEnd
      }));
    }
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [loopEnd, gridSnapEnabled, gridSize]);

  const handleDragRArrow = useCallback(() => {
    const handleMouseMove = e => {
      const scroll = store.getState().studio.scroll;
      const stop = (scroll + e.screenX - 220) / 40 + 1;
      const numDecimalPlaces = Math.max(0, String(1 / gridSize).length - 2);
      dispatch(setLoop({
        start: loopStart,
        stop: Math.max(
          loopStart + 1,
          gridSnapEnabled ? (Math.round((stop) * gridSize) / gridSize).toFixed(numDecimalPlaces) : stop
        )
      }));
    }
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [loopStart, gridSnapEnabled, gridSize]);

  const wrapperStyle = useMemo(() => {
    return {
      transform: `translate(${(loopStart - 1) * 40}px, 0)`,
      width: `${(loopEnd - loopStart) * 40}px`,
    };
  }, [loopStart, loopEnd]);

  return (
    <div className={`${styles.wrapper} ${loopEnabled ? styles.loopEnabled : ''}`} style={wrapperStyle}>
      <Arrow onMouseDown={handleDragLArrow}/>
      <Arrow onMouseDown={handleDragRArrow}/>
    </div>
  );
});

Looper.propTypes = {

};

const mapStateToProps = ({ studio }) => ({
  loopStart: studio.loop.start,
  loopEnd: studio.loop.stop,
  loopEnabled: studio.loopEnabled,
  gridSnapEnabled: studio.gridSnapEnabled,
  gridSize: studio.gridSize,
});

export default connect(mapStateToProps)(Looper);
