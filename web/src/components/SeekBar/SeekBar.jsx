import React, { memo, useState, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './SeekBar.module.scss';
import { ReactComponent as SeekBarSvg } from '../../assets/seekbar.svg';
import { connect } from 'react-redux';
import { setCurrentBeat, play, pause } from '../../actions/studioActions';
import store from '../../store';


const SeekBar = memo(props => {
  const currentBeat = props.currentBeat;
  const scroll = props.scroll;
  const playing = props.playing;

  const handleDragStart = useCallback(e => {
    props.dispatch(pause);
    const mousePosOffset = e.screenX;
    const startBeat = props.currentBeat;
    const handleMouseMove = e => {
      e.preventDefault();
      props.dispatch(setCurrentBeat(Math.max(1, startBeat + (e.screenX - mousePosOffset) / 40 / window.devicePixelRatio)));
    }
    const handleDragStop = () => {
      // Only plays if the music was playing when handleDragStart was called
      if (playing) {
        props.dispatch(play);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [playing, props.currentBeat]);

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
      <SeekBarSvg style={iconStyle} onMouseDown={handleDragStart}/>
      <div className={styles.bar} style={barStyle}/>
    </div>
  );
});

SeekBar.propTypes = {

};

const mapStateToProps = ({ studio }) => ({
  currentBeat: studio.currentBeat,
  scroll: studio.scroll,
  playing: studio.playing
});

export default connect(mapStateToProps)(SeekBar);

