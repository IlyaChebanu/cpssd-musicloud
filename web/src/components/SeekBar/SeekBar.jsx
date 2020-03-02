import React, { memo, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './SeekBar.module.scss';
import { ReactComponent as SeekBarSvg } from '../../assets/seekbar.svg';
import { setCurrentBeat, play, pause } from '../../actions/studioActions';


const SeekBar = memo((props) => {
  const {
    scroll, playing, dispatch, gridSize, currentBeatStudio,
  } = props;

  const currentBeat = props.currentBeat ? props.currentBeat : currentBeatStudio;

  const handleDragStart = useCallback((ev) => {
    dispatch(pause);
    const mousePosOffset = ev.screenX;
    const startBeat = currentBeat;
    const handleMouseMove = (e) => {
      e.preventDefault();
      dispatch(
        setCurrentBeat(
          Math.max(
            1,
            startBeat + (e.screenX - mousePosOffset) / (40 * gridSize) / window.devicePixelRatio,
          ),
        ),
      );
    };
    const handleDragStop = () => {
      // Only plays if the music was playing when handleDragStart was called
      if (playing) {
        dispatch(play);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [currentBeat, dispatch, gridSize, playing]);

  const offset = props.currentBeat ? 0 : 220;
  const iconStyle = useMemo(() => {
    const pos = -7 + offset + (currentBeat - 1) * (40 * gridSize) - scroll;
    return {
      transform: `translate(${pos}px, -0px)`,
      opacity: pos >= offset - 7 ? 1 : 0,
    };
  }, [currentBeat, gridSize, scroll, offset]);

  const barStyle = useMemo(() => {
    const pos = offset + (currentBeat - 1) * (40 * gridSize) - scroll;
    return {
      transform: `translate(${pos}px, 60px)`,
      opacity: pos >= offset ? 1 : 0,
    };
  }, [currentBeat, gridSize, scroll, offset]);

  return (
    <div className={styles.wrapper}>
      <SeekBarSvg style={iconStyle} onMouseDown={handleDragStart} />
      <div className={styles.bar} style={barStyle} />
    </div>
  );
});

SeekBar.propTypes = {
  currentBeat: PropTypes.number.isRequired,
  currentBeatStudio: PropTypes.number.isRequired,
  scroll: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  gridSize: PropTypes.number.isRequired,
};

SeekBar.displayName = 'SeekBar';

const mapStateToProps = ({ studio }) => ({
  currentBeatStudio: studio.currentBeat,
  scroll: studio.scroll,
  playing: studio.playing,
  gridSize: studio.gridSize,
});

export default connect(mapStateToProps)(SeekBar);
