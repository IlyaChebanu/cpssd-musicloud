import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './TrackControls.module.scss';
import { connect } from 'react-redux';
import { setTracks } from '../../actions/studioActions';
import { ReactComponent as Knob } from '../../assets/icons/Knob.svg';
import { ReactComponent as Mute } from '../../assets/icons/volume-up-light.svg';
import { ReactComponent as MuteActive } from '../../assets/icons/volume-slash-light.svg';
import { ReactComponent as Solo } from '../../assets/icons/headphones-alt-light.svg';
import { ReactComponent as SoloActive } from '../../assets/icons/headphones-alt-solid.svg';
import _ from 'lodash';
import { clamp, lerp } from '../../helpers/utils';
import store from '../../store';

const TrackControls = memo(props => {

  const handleTrackVolume = useCallback(e => {
    e.preventDefault();
    const tracks = [...props.tracks];
    const thisTrack = tracks[props.index];
    const startPos = e.screenY;
    const startVolume = thisTrack.volume;
    let lastVolume = startVolume;
    const handleMouseMove = e => {
      const tracks = [...store.getState().studio.tracks];
      const thisTrack = tracks[props.index];
      const pos = e.screenY;
      const volume = clamp(0, 1, startVolume - (pos - startPos) / 100);
      if (volume !== lastVolume) {
        lastVolume = volume;
        thisTrack.volume = volume;
        props.dispatch(setTracks(tracks));
      }
    }
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [props.index]);

  const handleTrackPan = useCallback(e => {
    e.preventDefault();
    const tracks = [...props.tracks];
    const thisTrack = tracks[props.index];
    const startPos = e.screenY;
    const startPan = thisTrack.pan;
    let lastPan = startPan;
    const handleMouseMove = e => {
      const tracks = [...store.getState().studio.tracks];
      const thisTrack = tracks[props.index];
      const pos = e.screenY;
      const pan = clamp(-1, 1, startPan - (pos - startPos) / 100);
      if (pan !== lastPan) {
        lastPan = pan;
        thisTrack.pan = pan;
        props.dispatch(setTracks(tracks));
      }
    }
    const handleDragStop = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragStop);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragStop);
  }, [props.index]);

  const handleTrackMute = useCallback(() => {
    const tracks = [...props.tracks];
    const thisTrack = tracks[props.index];
    thisTrack.mute = !thisTrack.mute;
    props.dispatch(setTracks(tracks));
  }, [props.index]);

  const handleTrackSolo = useCallback(() => {
    const tracks = props.tracks.map((track, i) => {
      track.solo = !track.solo && i === props.index;
      return track;
    });
    props.dispatch(setTracks(tracks));
  }, [props.index]);

  const track = props.tracks[props.index];
  const volumeStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, track.volume)}deg)`
  }), [track.volume]);

  const panStyle = useMemo(() => ({
    transform: `rotate(${lerp(-140, 140, (track.pan + 1) / 2)}deg)`
  }), [track.pan]);

  return (
    <div className={`${styles.wrapper} ${props.even ? styles.even : ''}`}>
      <div className={styles.title}>
        <p>Track name</p>
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
          {props.tracks[props.index].mute || _.find(props.tracks, 'solo') ?
            <MuteActive onClick={handleTrackMute}/> :
            <Mute onClick={handleTrackMute}/>}
          <p>Mute</p>
        </span>
        <span>
          {props.tracks[props.index].solo ?
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
  tracks: studio.tracks
});

export default connect(mapStateToProps)(TrackControls);

