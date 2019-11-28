import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './TrackControls.module.scss';
import { connect } from 'react-redux';
import { setTracks, setTrackAtIndex, setSelectedTrack } from '../../actions/studioActions';
import { ReactComponent as Knob } from '../../assets/icons/Knob.svg';
import { ReactComponent as Mute } from '../../assets/icons/volume-up-light.svg';
import { ReactComponent as MuteActive } from '../../assets/icons/volume-slash-light.svg';
import { ReactComponent as Solo } from '../../assets/icons/headphones-alt-light.svg';
import { ReactComponent as SoloActive } from '../../assets/icons/headphones-alt-solid.svg';
import _ from 'lodash';
import { clamp, lerp } from '../../helpers/utils';
import store from '../../store';
import { colours } from '../../helpers/constants';

const TrackControls = memo(props => {

  const handleTrackVolume = useCallback(e => {
    e.preventDefault();
    const startPos = e.screenY;
    const startVolume = props.track.volume;
    let lastVolume = startVolume;
    const handleMouseMove = e => {
      const track = store.getState().studio.tracks[props.index];
      const pos = e.screenY;
      const volume = clamp(0, 1, startVolume - (pos - startPos) / 200);
      if (volume !== lastVolume) {
        lastVolume = volume;
        track.volume = volume;
        props.dispatch(setTrackAtIndex(track, props.index));
      }
    }
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [props.index, props.track.volume]);

  const handleTrackPan = useCallback(e => {
    e.preventDefault();
    const startPos = e.screenY;
    const startPan = props.track.pan;
    let lastPan = startPan;
    const handleMouseMove = e => {
      const track = store.getState().studio.tracks[props.index];
      const pos = e.screenY;
      const pan = clamp(-1, 1, startPan - (pos - startPos) / 200);
      if (pan !== lastPan) {
        lastPan = pan;
        track.pan = pan;
        props.dispatch(setTrackAtIndex(track, props.index));
      }
    }
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [props.index, props.track.pan]);

  const handleTrackMute = useCallback(() => {
    props.track.mute = !props.track.mute;
    props.dispatch(setTrackAtIndex(props.track, props.index));
  }, [props.index, props.track.mute]);

  const handleTrackSolo = useCallback(() => {
    const tracks = store.getState().studio.tracks.map((track, i) => {
      track.solo = !track.solo && i === props.index;
      return track;
    });
    props.dispatch(setTracks(tracks));
  }, [props.index]);

  const track = props.track;
  const volumeStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, track.volume)}deg)`
  }), [track.volume]);

  const panStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, (track.pan + 1) / 2)}deg)`
  }), [track.pan]);

  const handleTrackNameChange = useCallback(e => {
    props.track.name = e.target.value;
    props.dispatch(setTrackAtIndex(props.track, props.index));
  }, [props.index, props.track]);

  const soloTrack = _.findIndex(props.tracks, 'solo');

  const handleSetSelected = useCallback(() => {
    props.dispatch(setSelectedTrack(props.index));
  }, [props.index]);

  return (
    <div className={`${styles.wrapper} ${props.index % 2 ? styles.even : ''}`} onMouseDown={handleSetSelected}>
      {props.selectedTrack === props.index && <div className={styles.selectedBar} style={{ backgroundColor: colours[props.index % colours.length]}}/>}
      <div className={styles.title}>
        <input type='text' value={track.name} onChange={handleTrackNameChange}/>
      </div>
      <div className={styles.buttons}>
        <span>
          <Knob onMouseDown={handleTrackVolume} style={volumeStyle}/>
          <p>Vol</p>
        </span>
        <span>
          <Knob onMouseDown={handleTrackPan} style={panStyle}/>
          <p>Pan</p>
        </span>
        <span>
          {props.track.mute || soloTrack !== -1 && soloTrack !== props.index ?
            <MuteActive onClick={handleTrackMute}/> :
            <Mute onClick={handleTrackMute}/>}
          <p>Mute</p>
        </span>
        <span>
          {props.track.solo ?
            <SoloActive onClick={handleTrackSolo}/> :
            <Solo onClick={handleTrackSolo}/>}
          <p>Solo</p>
        </span>
      </div>
    </div>
  );
});

TrackControls.propTypes = {
  even: PropTypes.bool,
  index: PropTypes.number.isRequired,
};

const mapStateToProps = ({ studio }) => ({
  tracks: studio.tracks,
  selectedTrack: studio.selectedTrack,
});

export default connect(mapStateToProps)(TrackControls);

