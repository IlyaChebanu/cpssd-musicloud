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
import ReactDOM from 'react-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GlobalHotKeys } from 'react-hotkeys';
import ReactTooltip from 'react-tooltip';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import styles from './Studio.module.scss';
import Header from '../../components/Header';
import {
  addTrack,
  setScroll,
  setGridWidth,
  setTempo,
  setSongImageUrl,
  setSongName,
  setSongDescription,
  hideSongPicker, showSongPicker, setCompleteTracksState, setCompleteSamplesState,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';
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
import Sample from '../../components/Sample/Sample';
import EffectsWindow from '../../components/EffectsWindow/EffectsWindow';


const Studio = memo((props) => {
  const {
    loopEnd, dispatch, studio, songPickerHidden, tracks, samples,
  } = props;

  const [tracksLoading, setTracksLoading] = useState(false);
  const [isLogoutShowing, setIsLogoutShowing] = useState(false);
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
          if (songState.tracks) dispatch(setCompleteTracksState(songState.tracks));
          if (songState.samples) dispatch(setCompleteSamplesState(songState.samples));
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
      dispatch(setCompleteTracksState([]));
      dispatch(setCompleteSamplesState([]));
      dispatch(setTempo(140));
      dispatch(showSongPicker());
    }
  }, [dispatch, songId]);


  const resizeGrid = useCallback(() => {
    let latest = _.maxBy(Object.values(samples), (s) => s.time + s.duration);
    latest = latest ? (latest.time + latest.duration) * (studio.tempo / 60) : 0;
    const width = Math.max(
      latest,
      tracksRef.current
        ? tracksRef.current.getBoundingClientRect().width
          / (studio.gridUnitWidth * studio.gridSize)
        : 0,
    );
    dispatch(setGridWidth(width + 10));
  }, [dispatch, samples, studio.gridSize, studio.gridUnitWidth, studio.tempo]);

  window.onresize = resizeGrid;
  useEffect(() => {
    resizeGrid();
  }, [dispatch, studio.gridSize, studio.tempo, samples, resizeGrid]);

  const handleScroll = useCallback(
    (e) => {
      dispatch(setScroll(e.target.scrollLeft));
    },
    [dispatch],
  );

  const handleAddNewTrack = useCallback((e) => {
    e.preventDefault();
    dispatch(addTrack());
  }, [dispatch]);

  const handleSaveState = useCallback(async (e) => {
    e.preventDefault();
    const songState = {
      tempo: studio.tempo,
      tracks,
      samples,
    };

    if (songId) {
      const res = await saveState(songId, songState);
      if (res.status === 200) {
        dispatch(showNotification({ message: 'Song saved', type: 'info' }));
      }
    }
  }, [studio.tempo, tracks, samples, songId, dispatch]);

  const renderableTracks = useMemo(() => tracks.map((t, i) => (
    <Track track={t} index={i} key={t.id} className={styles.track} />
  )), [tracks]);

  const trackControls = useMemo(
    () => tracks.map((track, i) => (
      <TrackControls index={i} key={track.id} track={track} />
    )),
    [tracks],
  );

  const seekBarPosition = useMemo(() => (
    220 + (studio.currentBeat - 1) * (studio.gridUnitWidth * studio.gridSize) - studio.scroll
  ), [studio.currentBeat, studio.gridSize, studio.gridUnitWidth, studio.scroll]);

  const keyMap = {
    SAVE: 'ctrl+s',
    UNDO: 'ctrl+z',
    REDO: 'ctrl+shift+z',
  };

  const handlers = {
    SAVE: handleSaveState,
    UNDO: () => dispatch(UndoActionCreators.undo()),
    REDO: () => dispatch(UndoActionCreators.redo()),
  };

  return (
    <GlobalHotKeys
      ignoreRepeatedEventsWhenKeyHeldDown={false}
      allowChanges
      keyMap={keyMap}
      handlers={handlers}
    >
      <div className={styles.wrapper}>

        <Header selected={0}>

          <Button dataTip="Save song state" className={styles.saveButton} onClick={handleSaveState}>
            Save
          </Button>
        </Header>
        <div style={{ pointerEvents: songPickerHidden ? 'auto' : 'none' }}>
          <div className={styles.contentWrapper}>
            <SampleControls />
            <SeekBar dataTip="Move seekbar to desired beat" position={seekBarPosition} />
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
                  {Object.entries(samples).map(([id, sample]) => (
                    <Sample data={sample} id={id} key={id} />

                  ))}

                </div>

              </div>
            </div>
          </div>
          <PianoRoll />

          <PlayBackControls style={{ 'pointer-events': 'none' }} />
          <FileExplorer />
          <PublishForm />
        </div>
        <SongPicker songs={[]} />
        <ReactTooltip id="tooltip" className={styles.tooltip} delayShow={500} />
        <EffectsWindow />
      </div>
    </GlobalHotKeys>
  );
});

Studio.propTypes = {
  loopEnd: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
  studio: PropTypes.object.isRequired,
  songPickerHidden: PropTypes.bool.isRequired,
  samples: PropTypes.object.isRequired,
};

Studio.displayName = 'Studio';

const mapStateToProps = ({ studio, studioUndoable }) => ({
  loopEnd: studio.loop.stop,
  studio,
  tracks: studioUndoable.present.tracks,
  samples: studioUndoable.present.samples,
  songPickerHidden: studio.songPickerHidden,
});

export default connect(mapStateToProps)(Studio);
