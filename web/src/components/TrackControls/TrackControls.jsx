import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import styles from './TrackControls.module.scss';
import {
  // setTrackAtIndex,
  setSelectedTrack,
  setSelectedSample,
  setTrackName,
  setTrackVolume,
  setTrackPan,
  setTrackMute,
  setTrackSolo,
} from '../../actions/studioActions';
import Knob from '../Knob';
import { ReactComponent as Mute } from '../../assets/icons/volume-up-light.svg';
import { ReactComponent as MuteActive } from '../../assets/icons/volume-slash-light.svg';
import { ReactComponent as Solo } from '../../assets/icons/headphones-alt-light.svg';
import { ReactComponent as SoloActive } from '../../assets/icons/headphones-alt-solid.svg';
import { clamp } from '../../helpers/utils';
import { colours } from '../../helpers/constants';


const TrackControls = memo((props) => {
  const {
    track, tracks, dispatch, index, selectedTrack,
  } = props;

  const soloTrack = _.find(tracks, 'solo');


  const handleSetTrackVolume = useCallback((val) => {
    dispatch(setTrackVolume(track.id, clamp(0, 1, val)));
  }, [dispatch, track.id]);

  const handleSetTrackPan = useCallback((val) => {
    dispatch(setTrackPan(track.id, clamp(-1, 1, val)));
  }, [dispatch, track.id]);

  const handleTrackMute = useCallback((e) => {
    dispatch(setTrackMute(track.id, !track.mute));
  }, [dispatch, track.id, track.mute]);

  const handleTrackSolo = useCallback(() => {
    dispatch(setTrackSolo(track.id, !track.solo));
  }, [dispatch, track.id, track.solo]);

  const handleTrackNameChange = useCallback((e) => {
    dispatch(setTrackName(track.id, e.target.value));
  }, [dispatch, track.id]);

  const handleSetSelected = useCallback(() => {
    dispatch(setSelectedTrack(track.id));
    dispatch(setSelectedSample(''));
  }, [dispatch, track.id]);


  const barStyle = useMemo(() => {
    const colour = index % 2 ? '#303237' : '#36393D';
    return {
      backgroundColor: selectedTrack === track.id ? colours[index % colours.length] : colour,
    };
  }, [index, selectedTrack, track.id]);

  return (
    <div
      className={styles.outerWrap}
      onClick={handleSetSelected}
      role="row"
      tabIndex={0}
    >
      <div
        className={`${styles.selectBar} ${selectedTrack === index ? styles.selected : ''}`}
        style={barStyle}
      />
      <div className={`${styles.wrapper} ${props.index % 2 ? styles.even : ''}`}>
        <div className={styles.title}>
          <input type="text" value={track.name} onChange={handleTrackNameChange} />
        </div>
        <div className={styles.buttons}>
          <Knob min={0} max={1} value={track.volume} onChange={handleSetTrackVolume} name="Vol" />
          <Knob min={-1} max={1} value={track.pan} onChange={handleSetTrackPan} name="Pan" />
          <span>
            {track.mute || (soloTrack && soloTrack.id !== track.id)
              ? <MuteActive onClick={handleTrackMute} />
              : <Mute onClick={handleTrackMute} />}
            <p>Mute</p>
          </span>
          <span>
            {track.solo
              ? <SoloActive onClick={handleTrackSolo} />
              : <Solo onClick={handleTrackSolo} />}
            <p>Solo</p>
          </span>
        </div>
      </div>
    </div>
  );
});

TrackControls.propTypes = {
  dispatch: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  track: PropTypes.object.isRequired,
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedTrack: PropTypes.number.isRequired,
};

TrackControls.displayName = 'TrackControls';

const mapStateToProps = ({ studio }) => ({
  tracks: studio.tracks,
  selectedTrack: studio.selectedTrack,
});

export default connect(mapStateToProps)(TrackControls);
