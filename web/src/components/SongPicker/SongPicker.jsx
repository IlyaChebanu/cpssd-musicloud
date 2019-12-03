import React, {
  memo, useMemo, useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './SongPicker.module.scss';
import OwnSongCard from '../OwnSongCard';
import NewSong from '../NewSong/NewSong';
import {
  setTracks, hideSongPicker, setTempo, setSongName, setSongId,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';
import { getEditableSongs, getSongState, createNewSong } from '../../helpers/api';

const SongPicker = memo((props) => {
  const { songs, dispatch, songPickerHidden } = props;
  const [gotSongs, setGotSongs] = useState([]);
  useEffect(() => {
    const getSongs = async () => {
      const res = await getEditableSongs();
      if (res.status === 200) {
        const s = [];
        res.data.songs.forEach((song) => {
          s.push(
            {
              name: song.title,

              tempo: 0,
              sid: song.sid,
            },
          );
        });
        setGotSongs(s);
      }
    };
    getSongs();
  }, [dispatch]);

  const handleCreateNewSong = useCallback(async (title) => {
    const res = await createNewSong(title);
    if (res.status === 200) {
      dispatch(setSongId(res.data.sid));
    }
  });

  const loadSong = useCallback((song) => {
    if (window.confirm(`Are you sure you want to load "${song.name}" song?`)) {
      dispatch(setTempo(song.tempo));
      dispatch(setTracks(song.tracks));
      dispatch(setSongName(song.name));
      dispatch(setSongId(song.sid));
      dispatch(hideSongPicker());
    }
  }, [dispatch]);

  const exampleSongCards = useMemo(() => songs.map((song, i) => (
    <OwnSongCard
      key={i}
      songName={`${song.name}`}
      className={styles.songCard}
      onClick={() => { loadSong(song); }}
    />
  )), [loadSong, songs]);

  const loadSongState = useCallback(async (song) => {
    const res = await getSongState(song.sid);
    if (res.status === 200) {
      dispatch(setSongId(song.sid));
      const songState = JSON.parse(res.data.song_state);
      songState.name = song.name;
      songState.sid = song.sid;
      if (songState.tempo === undefined) {
        songState.tempo = 140;
      }
      console.log(songState.tempo);
      if (songState.tracks === undefined) {
        songState.tracks = [];
      }
      loadSong(songState);
    }
  });


  const ownSongCards = useMemo(() => gotSongs.map((song, i) => (
    <OwnSongCard
      key={i}
      songName={`${song.name}`}
      className={styles.songCard}
      onClick={() => {
        loadSongState(song);
      }}
    />
  )), [gotSongs, loadSongState]);


  return (
    <div style={{ visibility: songPickerHidden ? 'hidden' : 'visible' }} className={styles.wrapper}>
      <div className={styles.songs}>
        <NewSong
          onClick={() => {
            const input = window.prompt('Enter the song name');
            if (input !== null && input !== '') {
              dispatch(setTracks([]));
              dispatch(setTempo(140));
              dispatch(setSongName(input));

              dispatch(hideSongPicker());
              handleCreateNewSong(input);
            } else if (input === '') {
              dispatch(showNotification({ message: 'Song name cannot be empty', type: 'error' }));
            }
          }}
          className={styles.songCard}
        />
        {exampleSongCards}
        {ownSongCards}
      </div>
    </div>
  );
});

SongPicker.propTypes = {
  dispatch: PropTypes.func.isRequired,
  songs: PropTypes.array,
  songPickerHidden: PropTypes.bool.isRequired,
};

SongPicker.defaultProps = {
  songs: [],
};

SongPicker.displayName = 'SongPicker';

const mapStateToProps = ({ studio }) => ({
  songPickerHidden: studio.songPickerHidden,
  tracks: studio.tracks,
});

export default connect(mapStateToProps)(SongPicker);
