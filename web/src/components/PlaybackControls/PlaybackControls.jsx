import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './PlaybackControls.module.scss';
import { ReactComponent as Play } from '../../assets/icons/play-circle-light.svg';
import { ReactComponent as Pause } from '../../assets/icons/pause-circle-light.svg';
import { ReactComponent as Back } from '../../assets/icons/go-back.svg';
import { ReactComponent as Forward } from '../../assets/icons/go-forward.svg';
import { ReactComponent as ToStart } from '../../assets/icons/to-start.svg';
import Slider from '../Slider/Slider';
import {
  setCurrentBeat, stop, pause, play,
} from '../../actions/studioActions';


const PlaybackControls = memo((props) => {
  const { dispatch, studio } = props;
  const { currentBeat, tempo, playing } = studio;

  const handlePlay = useCallback(() => {
    dispatch(play);
  }, [dispatch]);

  const handlePause = useCallback(() => {
    dispatch(pause);
  }, [dispatch]);

  const toStart = useCallback(() => {
    dispatch(setCurrentBeat(1));
    dispatch(stop);
  }, [dispatch]);

  const backward = useCallback(() => {
    dispatch(setCurrentBeat(Math.max(1, Math.floor(currentBeat - 1))));
  }, [dispatch, currentBeat]);

  const forward = useCallback(() => {
    dispatch(setCurrentBeat(Math.max(1, Math.floor(currentBeat + 1))));
  }, [currentBeat, dispatch]);


  const curSecond = ((currentBeat - 1) / tempo) * 60;
  const date = new Date(null);
  date.setSeconds(curSecond);
  date.setMilliseconds((curSecond * 1000) % 1000);
  const timeString = date.toISOString().substr(11, 11);

  return (
    <div className={styles.footer}>
      <span>
        <Slider />
        <ToStart className={styles.controlButton} onClick={toStart} />
        <Back className={styles.controlButton} onClick={backward} />
        {playing
          ? <Pause className={styles.controlButton} onClick={handlePause} />
          : <Play className={styles.controlButton} onClick={handlePlay} />}
        <Forward className={styles.controlButton} onClick={forward} />
        <p>{timeString}</p>
      </span>
    </div>
  );
});


PlaybackControls.propTypes = {
  dispatch: PropTypes.func.isRequired,
  studio: PropTypes.object.isRequired,
};

PlaybackControls.displayName = 'PlaybackControls';

const mapStateToProps = ({ studio }) => ({ studio });

export default withRouter(connect(mapStateToProps)(PlaybackControls));
