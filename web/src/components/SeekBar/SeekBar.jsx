import React, { memo, useState, useCallback, useMemo } from 'react';
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

  const handleDragStart = useCallback(() => {
    if (playing) {
      props.dispatch(pause);
    }
    const handleDragStop = () => {
      if (playing) {
        props.dispatch(play);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }
    const handleMouseMove = e => {
      const scroll = store.getState().studio.scroll;
      props.dispatch(setCurrentBeat(Math.max(scroll / 40 + 1, (scroll + e.screenX - 220) / 40 + 1)));
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [playing]);

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

