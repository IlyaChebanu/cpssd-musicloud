import React, { useCallback, memo } from 'react';
import cookie from 'js-cookie';
import PropTypes from 'prop-types';
import styles from './PlaybackControls.module.scss';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { ReactComponent as Play } from '../../assets/icons/play-circle-light.svg';
import { ReactComponent as Pause } from '../../assets/icons/pause-circle-light.svg';
import { ReactComponent as Back } from '../../assets/icons/go-back.svg';
import { ReactComponent as Forward } from '../../assets/icons/go-forward.svg';
import { ReactComponent as ToStart } from '../../assets/icons/to-start.svg';
import Slider from '../Slider/Slider';
import { setCurrentBeat, setScroll, stop, pause, play, setVolume } from '../../actions/studioActions';



const PlaybackControls = memo(props => {
  const handlePlay = useCallback(() => {
    props.dispatch(play);
  }, []);

  const handlePause = useCallback(() => {
    props.dispatch(pause);
  }, []);

  const toStart = useCallback(() => {
    props.dispatch(setCurrentBeat(1));
    props.dispatch(stop);
  }, []);

  const backward = useCallback(() => {
    props.dispatch(setCurrentBeat(Math.max(1, Math.floor(props.studio.currentBeat - 1))))
  }, [props.studio.currentBeat]);

  const forward = useCallback(() => {
    props.dispatch(setCurrentBeat(Math.max(1, Math.floor(props.studio.currentBeat + 1))))
  }, [props.studio.currentBeat]);


  const curSecond = (props.studio.currentBeat - 1) / props.studio.tempo * 60;
  var date = new Date(null);
  date.setSeconds(curSecond);
  date.setMilliseconds(curSecond * 1000 % 1000)
  var timeString = date.toISOString().substr(11, 11);

  return (
    <div className={styles.footer}>
      <span>
        <Slider />
        <ToStart className={styles.controlButton} onClick={toStart} />
        <Back className={styles.controlButton} onClick={backward} />
        {props.studio.playing ?
          <Pause className={styles.controlButton} onClick={handlePause} /> :
          <Play className={styles.controlButton} onClick={handlePlay} />}
        <Forward className={styles.controlButton} onClick={forward} />
        <p>{timeString}</p>
      </span>
    </div>
  );
});



PlaybackControls.propTypes = {

};

const mapStateToProps = ({ studio }) => ({ studio });

export default withRouter(connect(mapStateToProps)(PlaybackControls));

