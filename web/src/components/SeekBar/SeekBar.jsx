import React, { memo, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './SeekBar.module.scss';
import { ReactComponent as SeekBarSvg } from '../../assets/seekbar.svg';
import { setCurrentBeat, play, pause } from '../../actions/studioActions';


const SeekBar = memo((props) => {
  const {
    currentBeat, scroll, playing, dispatch,
  } = props;

  const handleDragStart = useCallback((ev) => {
    dispatch(pause);
    const mousePosOffset = ev.screenX;
    const startBeat = currentBeat;
    const handleMouseMove = (e) => {
      e.preventDefault();
      dispatch(
        setCurrentBeat(
          Math.max(1, startBeat + (e.screenX - mousePosOffset) / 40 / window.devicePixelRatio),
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
  }, [currentBeat, dispatch, playing]);

  const iconStyle = useMemo(() => {
    const pos = -7 + 220 + (currentBeat - 1) * 40 - scroll;
    return {
      transform: `translate(${pos}px, -0px)`,
      opacity: pos >= 213 ? 1 : 0,
    };
  }, [currentBeat, scroll]);

  const barStyle = useMemo(() => {
    const pos = 220 + (currentBeat - 1) * 40 - scroll;
    return {
      transform: `translate(${pos}px, 60px)`,
      opacity: pos >= 220 ? 1 : 0,
    };
  }, [currentBeat, scroll]);

  return (
    <div className={styles.wrapper}>
      <SeekBarSvg style={iconStyle} onMouseDown={handleDragStart} />
      <div className={styles.bar} style={barStyle} />
    </div>
  );
});

SeekBar.propTypes = {
  currentBeat: PropTypes.number.isRequired,
  scroll: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

SeekBar.displayName = 'SeekBar';

const mapStateToProps = ({ studio }) => ({
  currentBeat: studio.currentBeat,
  scroll: studio.scroll,
  playing: studio.playing,
});

export default connect(mapStateToProps)(SeekBar);
