/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Studio.module.scss';
import Header from '../../components/Header';
import {
  // setTracks,
  addTrack,
  setScroll,
  setGridWidth,
  setTempo,
  setSongImageUrl,
  setSongName,
  setSongDescription,
  hideSongPicker, showSongPicker,
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

import { saveState, getSongState, getSongInfo } from '../../helpers/api';
import { useUpdateUserDetails } from '../../helpers/hooks';
import Spinner from '../../components/Spinner/Spinner';
import PublishForm from '../../components/PublishForm/PublishForm';
import PianoRoll from '../../components/PianoRoll/PianoRoll';

import FileExplorer from '../../components/FileExplorer/FileExplorer';

const Studio = memo((props) => {
  const { dispatch, tracks, studio } = props;

  const [tracksLoading, setTracksLoading] = useState(false);

  useUpdateUserDetails();
  const tracksRef = useRef();

  const urlParams = new URLSearchParams(window.location.search);
  const songId = Number(urlParams.get('sid'));

  useEffect(() => {
    if (songId) {
      (async () => {
        setTracksLoading(true);
        const res = await getSongState(songId);
        setTracksLoading(false);
        if (res.status === 200) {
          const songState = res.data.song_state;
          // if (songState.tracks) dispatch(setTracks(songState.tracks));
          if (songState.tempo) dispatch(setTempo(songState.tempo));
          const res2 = await getSongInfo(songId);
          if (res2.status === 200) {
            dispatch(setSongImageUrl(res2.data.song.cover));
            dispatch(setSongName(res2.data.song.title));
            dispatch(setSongDescription(res2.data.song.description));
            dispatch(hideSongPicker());
          }
        }
      })();
    } else {
      // dispatch(setTracks([]));
      dispatch(setTempo(140));
      dispatch(showSongPicker());
    }
  }, [dispatch, songId]);

  useEffect(() => {
    const resizeGrid = () => {
      const latest = tracks.reduce((m, track) => {
        const sampleMax = track.samples
          ? track.samples.reduce((sm, sample) => {
            const endTime = sample.time + sample.duration * (studio.tempo / 60);
            return Math.max(endTime, sm);
          }, 1)
          : 1;
        return Math.max(sampleMax, m);
      }, 1);
      const width = Math.max(
        latest,
        tracksRef.current
          ? tracksRef.current.getBoundingClientRect().width
            / (40 * studio.gridSize)
          : 0,
      );
      dispatch(setGridWidth(width));
    };
    resizeGrid();
    window.addEventListener('resize', resizeGrid);
    return () => {
      window.removeEventListener('resize', resizeGrid);
    };
  }, [dispatch, tracks, studio.gridSize, studio.tempo, tracksRef]);

  const handleScroll = useCallback(
    (e) => {
      dispatch(setScroll(e.target.scrollLeft));
    },
    [dispatch],
  );

  const handleAddNewTrack = useCallback(() => {
    dispatch(addTrack());
    // dispatch(
    //   setTracks([
    //     ...tracks,
    //     {
    //       volume: 1,
    //       pan: 0,
    //       mute: false,
    //       solo: false,
    //       name: 'New track',
    //       samples: [],
    //     },
    //   ]),
    // );
  }, [dispatch]);

  const handleSaveState = useCallback(async (e) => {
    e.preventDefault();
    const songState = {
      tempo: studio.tempo,
      tracks,
    };

    if (songId) {
      const res = await saveState(songId, songState);
      if (res.status === 200) {
        dispatch(showNotification({ message: 'Song saved', type: 'info' }));
      }
    }
  }, [studio.tempo, tracks, dispatch, songId]);

  const renderableTracks = useMemo(() => tracks.map((t, i) => (
    <Track track={t} index={i} key={t.id} className={styles.track} />
  )), [tracks]);

  const trackControls = useMemo(
    () => tracks.map((track, i) => (
      <TrackControls index={i} key={track.id} track={track} />
    )),
    [tracks],
  );

  const trackControlsStyle = useMemo(
    () => ({
      transform: `translateY(${-studio.scrollY}px)`,
    }),
    [studio.scrollY],
  );

  return (
    <div className={styles.wrapper}>
      <Header selected={0}>
        <Button className={styles.saveButton} onClick={handleSaveState}>
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
                className={`${styles.newTrack} ${
                  tracks.length % 2 !== 1 ? styles.even : ''
                }`}
                onClick={handleAddNewTrack}
                role="button"
                tabIndex={0}
              >
                Add new track
              </div>
            </div>
            <div
              className={styles.tracks}
              onScroll={handleScroll}
              ref={tracksRef}
            >
              {tracksLoading ? <Spinner /> : renderableTracks}
            </div>
          </div>
        </div>
      </div>
      <PianoRoll />
      <PlayBackControls style={{ 'pointer-events': 'none' }} />
      <SongPicker songs={[]} />
      <FileExplorer />
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
