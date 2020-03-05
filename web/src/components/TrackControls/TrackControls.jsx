import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import styles from './TrackControls.module.scss';
import { setTrackAtIndex, setSelectedTrack } from '../../actions/studioActions';
import { ReactComponent as Knob } from '../../assets/icons/Knob.svg';
import { ReactComponent as Mute } from '../../assets/icons/volume-up-light.svg';
import { ReactComponent as MuteActive } from '../../assets/icons/volume-slash-light.svg';
import { ReactComponent as Solo } from '../../assets/icons/headphones-alt-light.svg';
import { ReactComponent as SoloActive } from '../../assets/icons/headphones-alt-solid.svg';
import { clamp, lerp } from '../../helpers/utils';
import { colours } from '../../helpers/constants';


const TrackControls = memo((props) => {
  const {
    track, tracks, dispatch, index, selectedTrack,
  } = props;

  const handleTrackVolume = useCallback((ev) => {
    ev.preventDefault();
    const startPos = ev.screenY;
    const startVolume = track.volume;
    let lastVolume = startVolume;
    const handleMouseMove = (e) => {
      const pos = e.screenY;
      const volume = clamp(0, 1, startVolume - (pos - startPos) / 200);
      if (volume !== lastVolume) {
        lastVolume = volume;
        const newTrack = { ...track, volume };
        dispatch(setTrackAtIndex(newTrack, index));
      }
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, index, track]);

  const handleTrackPan = useCallback((ev) => {
    ev.preventDefault();
    const startPos = ev.screenY;
    const startPan = track.pan;
    let lastPan = startPan;
    const handleMouseMove = (e) => {
      const pos = e.screenY;
      const pan = clamp(-1, 1, startPan - (pos - startPos) / 200);
      if (pan !== lastPan) {
        lastPan = pan;
        const newTrack = { ...track, pan };
        dispatch(setTrackAtIndex(newTrack, index));
      }
    };
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [dispatch, index, track]);

  const unSoloTracks = useCallback(() => {
    tracks.forEach((t, i) => {
      const newTrack = { ...t, solo: false };
      dispatch(setTrackAtIndex(newTrack, i));
    });
  }, [dispatch, tracks]);

  const handleTrackMute = useCallback((e) => {
    e.preventDefault();
    track.mute = !track.mute;
    dispatch(setTrackAtIndex(track, props.index));
  }, [dispatch, props.index, track]);

  const handleTrackSolo = useCallback((e) => {
    e.preventDefault();
    unSoloTracks();
    const newTrack = { ...track, solo: !track.solo };
    dispatch(setTrackAtIndex(newTrack, index));
  }, [dispatch, index, track, unSoloTracks]);

  const volumeStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, track.volume)}deg)`,
  }), [track.volume]);

  const panStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, (track.pan + 1) / 2)}deg)`,
  }), [track.pan]);

  const handleTrackNameChange = useCallback((e) => {
    track.name = e.target.value;
    dispatch(setTrackAtIndex(track, index));
  }, [dispatch, index, track]);

  const soloTrack = _.findIndex(tracks, 'solo');

  const handleSetSelected = useCallback((e) => {
    e.preventDefault();
    dispatch(setSelectedTrack(index));
  }, [dispatch, index]);

  const barStyle = useMemo(() => {
    const colour = index % 2 ? '#303237' : '#36393D';
    return {
      backgroundColor: selectedTrack === index ? colours[index % colours.length] : colour,
    };
  }, [index, selectedTrack]);

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
          <span>
            <Knob onMouseDown={handleTrackVolume} style={volumeStyle} />
            <p>Vol</p>
          </span>
          <span>
            <Knob onMouseDown={handleTrackPan} style={panStyle} />
            <p>Pan</p>
          </span>
          <span>
            {track.mute || (soloTrack !== -1 && soloTrack !== index)
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
