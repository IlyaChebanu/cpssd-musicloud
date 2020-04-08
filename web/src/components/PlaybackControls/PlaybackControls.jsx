/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { GlobalHotKeys } from 'react-hotkeys';
import styles from './PlaybackControls.module.scss';
import { ReactComponent as Play } from '../../assets/icons/play-circle-light.svg';
import { ReactComponent as Pause } from '../../assets/icons/pause-circle-light.svg';
import { ReactComponent as Back } from '../../assets/icons/go-back.svg';
import { ReactComponent as Forward } from '../../assets/icons/go-forward.svg';
import { ReactComponent as ToStart } from '../../assets/icons/to-start.svg';
import { ReactComponent as FileExplorerClosed } from '../../assets/icons/file-explorer.svg';
import { ReactComponent as FileExplorerOpened } from '../../assets/icons/folder-24px.svg';
import Slider from '../Slider/Slider';
import {
  setCurrentBeat, stop, pause, play,
  hideFileExplorer,
  showFileExplorer,
  stopRecording,
  startRecording,
} from '../../actions/studioActions';

const PlaybackControls = memo((props) => {
  const {
    dispatch, studio, songPickerHidden, fileExplorerHidden,
  } = props;
  const {
    currentBeat, tempo, playing, recording,
  } = studio;
  const handlePlay = useCallback((e) => {
    if (songPickerHidden) {
      e.preventDefault();
      dispatch(play);
    }
  }, [dispatch, songPickerHidden]);

  const handlePause = useCallback((e) => {
    if (songPickerHidden) {
      e.preventDefault();
      dispatch(pause);
    }
  }, [dispatch, songPickerHidden]);

  const handleRecording = useCallback((e) => {
    e.preventDefault();
    if (recording) {
      dispatch(stopRecording());
    } else {
      dispatch(startRecording());
    }
  }, [dispatch, recording]);

  const toStart = useCallback((e) => {
    if (songPickerHidden) {
      e.preventDefault();
      dispatch(setCurrentBeat(1));
      dispatch(stop);
    }
  }, [dispatch, songPickerHidden]);

  const backward = useCallback((e) => {
    e.preventDefault();
    if (songPickerHidden) {
      if (playing) {
        dispatch(pause);
        dispatch(setCurrentBeat(Math.max(1, Math.floor(currentBeat - 1))));
        dispatch(play);
      } else {
        dispatch(setCurrentBeat(Math.max(1, Math.floor(currentBeat - 1))));
      }
    }
  }, [songPickerHidden, playing, dispatch, currentBeat]);

  const forward = useCallback((e) => {
    e.preventDefault();
    if (songPickerHidden) {
      if (playing) {
        dispatch(pause);
        dispatch(setCurrentBeat(Math.max(1, Math.floor(currentBeat + 1))));
        dispatch(play);
      } else {
        dispatch(setCurrentBeat(Math.max(1, Math.floor(currentBeat + 1))));
      }
    }
  }, [currentBeat, dispatch, playing, songPickerHidden]);

  const showExplorer = useCallback((e) => {
    e.preventDefault();
    dispatch(showFileExplorer());
  }, [dispatch]);

  const hideExplorer = useCallback((e) => {
    e.preventDefault();
    dispatch(hideFileExplorer());
  }, [dispatch]);

  const curSecond = ((currentBeat - 1) / tempo) * 60;
  const date = new Date(null);
  date.setSeconds(curSecond);
  date.setMilliseconds((curSecond * 1000) % 1000);
  const timeString = date.toISOString().substr(11, 11);

  // Currently not supporting holding button for repeated action
  const keyMap = {
    PLAY_PAUSE: 'space',
    BACKWARD: 'pagedown',
    FORWARD: 'pageup',
    TO_START: 'home',
  };

  const handlers = {
    PLAY_PAUSE: playing ? handlePause : handlePlay,
    BACKWARD: backward,
    FORWARD: forward,
    TO_START: toStart,
  };

  return (
    <GlobalHotKeys
      ignoreRepeatedEventsWhenKeyHeldDown={false}
      allowChanges
      keyMap={keyMap}
      handlers={handlers}
    >
      <div className={styles.footer}>

        <span>
          <Slider />
          <ToStart className={styles.controlButton} onClick={toStart} />
          <Back className={styles.controlButton} onClick={backward} />
          {playing ? (
            <Pause className={styles.controlButton} onClick={handlePause} />
          ) : (
            <Play className={styles.controlButton} onClick={handlePlay} />
          )}
          <Forward className={styles.controlButton} onClick={forward} />
          <div
            className={`${styles.recordButtonOuter} ${recording ? styles.active : ''}`}
            onClick={handleRecording}
          >
            <div className={styles.recordButtonInner} />
          </div>
          <p>{timeString}</p>
        </span>
        <div
          data-place="left"
          data-tip={fileExplorerHidden ? 'Open file explorer' : 'Close file explorer'}
        >
          { fileExplorerHidden
            ? (
              <FileExplorerClosed

                id="explorer"
                className={styles.selectedIcon}

                onClick={fileExplorerHidden ? showExplorer : hideExplorer}
              />
            )
            : (
              <FileExplorerOpened
                className={styles.selectedIcon}
                style={{ height: '60px' }}
                id="explorer"
                onClick={fileExplorerHidden ? showExplorer : hideExplorer}
              />
            )}
        </div>
      </div>
    </GlobalHotKeys>
  );
});

PlaybackControls.propTypes = {
  dispatch: PropTypes.func.isRequired,
  studio: PropTypes.object.isRequired,
  songPickerHidden: PropTypes.bool.isRequired,
  fileExplorerHidden: PropTypes.bool.isRequired,
};

PlaybackControls.displayName = 'PlaybackControls';

const mapStateToProps = ({ studio }) => ({
  studio,
  songPickerHidden: studio.songPickerHidden,
  fileExplorerHidden: studio.fileExplorerHidden,
});

export default withRouter(connect(mapStateToProps)(PlaybackControls));
