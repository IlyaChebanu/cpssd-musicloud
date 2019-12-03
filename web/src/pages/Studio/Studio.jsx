/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
import React, {
  memo, useCallback, useEffect, useMemo, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Studio.module.scss';
import Header from '../../components/Header';
import {
  setTracks, setScroll, setScrollY, setGridWidth,
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
import TimelineControls from '../../components/TimelineControls';
import SeekBar from '../../components/SeekBar';
import TrackControls from '../../components/TrackControls';
import Button from '../../components/Button';
import PlayBackControls from '../../components/PlaybackControls';

import Track from '../../components/Track/Track';

import { saveState } from '../../helpers/api';
import { useUpdateUserDetails } from '../../helpers/hooks';

const Studio = memo((props) => {
  const { dispatch, tracks, studio } = props;

  useUpdateUserDetails();

  const tracksRef = useRef();

  useEffect(() => {
    const latest = tracks.reduce((m, track) => {
      const sampleMax = track.samples.reduce((sm, sample) => {
        const endTime = sample.time + (sample.duration * (studio.tempo / 60));
        return Math.max(endTime, sm);
      }, 1);
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

  useEffect(() => {
    dispatch(setTracks([
      {
        volume: 0.1,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Kick',
        samples: [
          {
            id: 1,
            time: 1,
            url: '/static/media/kick.0bfa7d2f.wav',
            duration: 0.5,
            volume: 0.06000000000000005,
            track: 0,
            buffer: {},
            endTime: 297.74,
          },
          {
            id: 'MC40OTQ2MzU1',
            time: 5,
            url: '/static/media/kick.0bfa7d2f.wav',
            duration: 0.5,
            track: 0,
            volume: 0.06000000000000005,
            buffer: {},
            endTime: 298.34000000000003,
          },
          {
            id: 'MC44NDMzNjU5',
            time: 13,
            url: '/static/media/kick.0bfa7d2f.wav',
            duration: 0.5,
            track: 0,
            volume: 0.06000000000000005,
            buffer: {},
            endTime: 299.54,
          },
        ],
      },
      {
        volume: 0.1,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Clap',
        samples: [
          {
            id: 2,
            time: 5,
            url: '/static/media/clap.e0ff8267.wav',
            duration: 0.75,
            volume: 0.06999999999999995,
            track: 1,
            buffer: {},
            endTime: 298.59000000000003,
          },
          {
            id: 'MC43MjcxOTk5',
            time: 12,
            url: '/static/media/clap.e0ff8267.wav',
            duration: 0.75,
            volume: 0.06999999999999995,
            track: 1,
            buffer: {},
            endTime: 299.64,
          },
        ],
      },
      {
        volume: 0.1,
        mute: true,
        solo: false,
        pan: 0,
        name: 'Crash',
        samples: [
          {
            id: 3,
            time: 15,
            url: '/static/media/crash.cad7e819.wav',
            duration: 1.7142708333333334,
            volume: 0.050000000000000044,
            track: 2,
            buffer: {},
            endTime: 298.80427083333336,
          },
        ],
      },
      {
        volume: 0.1,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Hat',
        samples: [
          {
            id: 4,
            time: 7,
            url: '/static/media/hat.b1186440.wav',
            duration: 0.25,
            volume: 0.020000000000000018,
            track: 3,
            buffer: {},
            endTime: 298.39,
          },
          {
            id: 'MC40ODAyNjgz',
            time: 9,
            url: '/static/media/hat.b1186440.wav',
            duration: 0.25,
            volume: 0.020000000000000018,
            track: 3,
            buffer: {},
            endTime: 298.69,
          },
          {
            id: 'MC40NDQ2NTY3',
            time: 11,
            url: '/static/media/hat.b1186440.wav',
            duration: 0.25,
            volume: 0.020000000000000018,
            track: 3,
            buffer: {},
            endTime: 298.99,
          },
          {
            id: 'MC4yNzYwNDUw',
            time: 13,
            url: '/static/media/hat.b1186440.wav',
            duration: 0.25,
            volume: 0.020000000000000018,
            track: 3,
            buffer: {},
            endTime: 299.29,
          },
        ],
      },
      {
        volume: 0.1,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Open hat',
        samples: [
          {
            id: 'MC4yMTUyOTQ1',
            time: 15,
            url: '/static/media/openhat.8431cd41.wav',
            duration: 0.25,
            volume: 0.10999999999999999,
            track: 4,
            buffer: {},
            endTime: 299.59000000000003,
          },
          {
            id: 'MC43OTQwNDQ4',
            time: 3,
            url: '/static/media/openhat.8431cd41.wav',
            duration: 0.25,
            volume: 0.10999999999999999,
            track: 4,
            buffer: {},
            endTime: 297.79,
          },
        ],
      },
      {
        volume: 0.1,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Snare',
        samples: [
          {
            id: 'MC4zMjY5Mjk0',
            time: 14,
            url: '/static/media/snare.a6b07320.wav',
            duration: 0.5,
            track: 5,
            volume: 0.12,
            buffer: {},
            endTime: 299.69,
          },
          {
            id: 'MC40ODcwMjUy',
            time: 7,
            url: '/static/media/snare.a6b07320.wav',
            duration: 0.5,
            track: 5,
            volume: 0.12,
            buffer: {},
            endTime: 298.64,
          },
        ],
      },
      {
        volume: 0.1,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Triangle',
        samples: [
          {
            id: 7,
            time: 1,
            url: '/static/media/triangle.620921d6.wav',
            duration: 0.857125,
            volume: 0.12,
            track: 6,
            buffer: {},
            endTime: 298.097125,
          },
        ],
      },
      {
        volume: 0.1,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Percussion',
        samples: [
          {
            id: 8,
            time: 4,
            url: '/static/media/percussion.61cb7109.wav',
            duration: 0.21875,
            volume: 0.12,
            track: 7,
            buffer: {},
            endTime: 297.90875,
          },
          {
            id: 'MC40MTM2OTMy',
            time: 11,
            url: '/static/media/percussion.61cb7109.wav',
            duration: 0.21875,
            volume: 0.12,
            track: 7,
            buffer: {},
            endTime: 298.95875,
          },
          {
            id: 'MC4yNzU4NDM0',
            time: 14,
            url: '/static/media/percussion.61cb7109.wav',
            duration: 0.21875,
            volume: 0.12,
            track: 7,
            buffer: {},
            endTime: 299.40875,
          },
        ],
      },
      {
        volume: 1,
        mute: false,
        solo: false,
        pan: 0,
        name: 'Bass',
        samples: [
          {
            id: 'MC4yNzU4N53450',
            time: 1,
            url: '/static/media/bass.a24f6a59.wav',
            duration: 2.3339791666666665,
            volume: 1,
            track: 8,
            buffer: {},
            endTime: 299.5739791666667,
          },
        ],
      },
    ]));
  }, [dispatch]);

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
    <Track index={i} track={t} key={i} className={styles.track} />
  )), [tracks]);

  const trackControls = useMemo(() => tracks.map((track, i) => (
    <TrackControls key={i} track={track} index={i} />
  )), [tracks]);

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
              {renderableTracks}
            </div>
          </div>
        </div>
      </div>
      <PlayBackControls />
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
