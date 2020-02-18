/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
import React, {
  memo, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Studio.module.scss';
import Header from '../../components/Header';
import {
  setTracks, setScroll, setScrollY, setGridWidth, setTempo,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';
import kick from '../../assets/basic_sounds/kick.wav';
import clap from '../../assets/basic_sounds/clap.wav';
import crash from '../../assets/basic_sounds/crash.wav';
import hat from '../../assets/basic_sounds/hat.wav';
import openhat from '../../assets/basic_sounds/openhat.wav';
import percussion from '../../assets/basic_sounds/percussion.wav';
import snare from '../../assets/basic_sounds/snare.wav';
import triangle from '../../assets/basic_sounds/triangle.wav';
import bass from '../../assets/samples/bass.wav';
import Timeline from '../../components/Timeline';
import SeekBar from '../../components/SeekBar';
import TrackControls from '../../components/TrackControls';
import Button from '../../components/Button';
import PlayBackControls from '../../components/PlaybackControls';
import SongPicker from '../../components/SongPicker';
import Track from '../../components/Track/Track';
import SampleControls from '../../components/SampleControls';

import { saveState, getSongState } from '../../helpers/api';
import { useUpdateUserDetails } from '../../helpers/hooks';
import store from '../../store';
import Spinner from '../../components/Spinner/Spinner';
import PublishForm from '../../components/PublishForm/PublishForm';
import PianoRoll from '../../components/PianoRoll/PianoRoll';

const Studio = memo((props) => {
  const { dispatch, tracks, studio } = props;

  const [tracksLoading, setTracksLoading] = useState(false);

  useUpdateUserDetails();
  const tracksRef = useRef();

  useEffect(() => {
    if (studio.songId) {
      (async () => {
        setTracksLoading(true);
        const res = await getSongState(studio.songId);
        setTracksLoading(false);
        if (res.status === 200) {
          const songState = res.data.song_state;
          if (songState.tracks) dispatch(setTracks(songState.tracks));
          if (songState.tempo) dispatch(setTempo(songState.tempo));
        }
      })();
    }
  }, [dispatch, studio.songId]);

  useEffect(() => {
    const latest = tracks.reduce((m, track) => {
      const sampleMax = track.samples ? track.samples.reduce((sm, sample) => {
        const endTime = sample.time + (sample.duration * (studio.tempo / 60));
        return Math.max(endTime, sm);
      }, 1) : 1;
      return Math.max(sampleMax, m);
    }, 1);
    const width = Math.max(
      latest,
      tracksRef.current
        ? tracksRef.current.getBoundingClientRect().width / (40 * studio.gridSize)
        : 0,
    );
    dispatch(setGridWidth(width));
  }, [dispatch, tracks, studio.gridSize, studio.tempo, tracksRef]);

  const handleScroll = useCallback((e) => {
    dispatch(setScroll(e.target.scrollLeft));
  }, [dispatch]);

  const handleAddNewTrack = useCallback(() => {
    dispatch(setTracks([
      ...tracks,
      {
        volume: 1,
        pan: 0,
        mute: false,
        solo: false,
        name: 'New track',
        samples: [],
      },
    ]));
  }, [dispatch, tracks]);

  const handleSaveState = useCallback(async (e) => {
    e.preventDefault();
    const songState = {
      tempo: studio.tempo,
      tracks,
    };
    /* At the moment, this just uses the hardcoded song ID in the state (1001). */
    /* The user who has edit permission for the song by default it Kamil. */
    /* You can add your uid and the sid 1001 to the Song_Editors table to */
    /* save from your account. */
    const res = await saveState(studio.songId, songState);
    if (res.status === 200) {
      dispatch(showNotification({ message: 'Song saved', type: 'info' }));
    }
  }, [studio.tempo, studio.songId, tracks, dispatch]);

  const renderableTracks = useMemo(() => tracks.map((t, i) => (
    <Track index={i} track={{ ...t }} key={i} className={styles.track} />
  )), [tracks]);

  const trackControls = useMemo(() => tracks.map((track, i) => (
    <TrackControls key={i} track={track} index={i} />
  )), [tracks]);

  const trackControlsStyle = useMemo(() => ({
    transform: `translateY(${-studio.scrollY}px)`,
  }), [studio.scrollY]);

  return (
    <div className={styles.wrapper}>
      <Header selected={0}>
        <Button
          className={styles.saveButton}
          onClick={handleSaveState}
        >
          Save
        </Button>
      </Header>
      <div className={styles.contentWrapper}>
        <SampleControls />
        <SeekBar />

        <Timeline />
        <div className={styles.scrollable}>
          <div className={styles.content}>
            <div className={styles.trackControls}>
              {trackControls}
              <div
                className={`${styles.newTrack} ${tracks.length % 2 !== 1 ? styles.even : ''}`}
                onClick={handleAddNewTrack}
                role="button"
                tabIndex={0}
              >
                Add new track
              </div>
            </div>
            <div className={styles.tracks} onScroll={handleScroll} ref={tracksRef}>
              {tracksLoading ? <Spinner /> : renderableTracks}
            </div>
          </div>
        </div>
      </div>
      <PianoRoll />
      <PlayBackControls style={{ 'pointer-events': 'none' }} />
      <SongPicker songs={[]} />
      <PublishForm />
    </div>

  );
});

Studio.propTypes = {
  dispatch: PropTypes.func.isRequired,
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
  studio: PropTypes.object.isRequired,
};

Studio.displayName = 'Studio';

const mapStateToProps = ({ studio }) => ({ studio, tracks: studio.tracks });

export default connect(mapStateToProps)(Studio);
