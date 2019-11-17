import React, { memo, useCallback, useEffect, useMemo } from 'react';
import styles from './Studio.module.scss';
import Header from '../../components/Header';
import { play, pause, stop, setTempo, setVolume, setTracks, setScroll } from '../../actions/studioActions';
import { connect } from 'react-redux';
import kick from '../../assets/basic_sounds/kick.wav';
import bass from '../../assets/samples/bass.wav';
import Timeline from '../../components/Timeline';
import TimelineControls from '../../components/TimelineControls';
import SeekBar from '../../components/SeekBar';
import TrackControls from '../../components/TrackControls';
import Sample from '../../components/Sample/Sample';

import FileUploader from '../../components/FileUploader';
import Track from '../../components/Track/Track';

const Studio = memo(props => {
  const { dispatch } = props;

  const handlePlay = useCallback(() => {
    props.dispatch(play);
  }, []);

  const handlePlause = useCallback(() => {
    props.dispatch(pause);
  }, []);

  const handleStop = useCallback(() => {
    props.dispatch(stop);
  }, []);

  const handleTempo = useCallback(e => {
    props.dispatch(setTempo(Math.max(Number(e.target.value), 0)));
  }, []);

  const handleVolume = useCallback(e => {
    props.dispatch(setVolume(Math.max(Number(e.target.value), 0)));
  }, []);

  useEffect(() => {
    dispatch(setTracks([
      {
        volume: 0.25,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Bass',
        samples: [
          {
            id: 1,
            time: 1,
            url: kick
          },
          {
            id: 3,
            time: 3,
            url: kick
          },
        ]
      },
      {
        volume: 1,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Kick',
        samples: [
          {
            id: 2,
            time: 2,
            url: kick
          },
          {
            id: 4,
            time: 4,
            url: bass
          },
        ]
      }
    ]));
  }, []);

  const handleScroll = useCallback(e => {
    props.dispatch(setScroll(e.target.scrollLeft));
  }, []);

  const tracks = useMemo(() => {
    return props.tracks.map((t, i) => (
      <Track index={i} track={t} key={i}/>
    ));
  }, [props.tracks]);

  const handleAddNewTrack = useCallback(() => {
    props.dispatch(setTracks([
      ...props.tracks,
      {
        volume: 1,
        pan: 0,
        mute: false,
        solo: false,
        name: 'New track',
        samples: []
      }
    ]));
  }, [props.tracks]);

  return (
    <div className={styles.wrapper}>
      <Header selected={0}/>
      <div className={styles.contentWrapper}>
        <SeekBar/>
        <div className={styles.sidebar}>
          <TimelineControls />
          {props.tracks.map((track, i) => {
            return <TrackControls key={i} track={track} index={i}/>;
          })}
          <div className={`${styles.newTrack} ${props.tracks.length % 2 !== 1 ? styles.even : ''}`} onClick={handleAddNewTrack}>
            Add new track
          </div>
        </div>
        <div className={styles.scrollableMain} onScroll={handleScroll}>
          <div className={styles.mainContent}>
            <Timeline />
            {tracks}
            <button onClick={handlePlay}>Play</button>
            <button onClick={handlePlause}>Pause</button>
            <button onClick={handleStop}>Stop</button>
          </div>
        </div>
      </div>
    </div>
  );
});

Studio.propTypes = {

};

const mapStateToProps = ({ studio }) => ({ studio, tracks: studio.tracks });

export default connect(mapStateToProps)(Studio);