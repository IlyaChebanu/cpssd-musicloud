import React, {
  memo, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './SongPicker.module.scss';
import OwnSongCard from '../OwnSongCard';
import NewSong from '../NewSong/NewSong';
import {
  setTracks, hideSongPicker, setTempo, showSongPicker,
} from '../../actions/studioActions';
import { showNotification } from '../../actions/notificationsActions';
import store from '../../store';

const cards = [];


for (let i = 0; i < 20; i++) {
  cards.push(<OwnSongCard key={i} songName={`Song ${i}`} className={styles.songCard} />);
}

const SongPicker = memo((props) => {
  const { songs, dispatch } = props;
  const songCards = useMemo(() => songs.map((song, i) => (
    <OwnSongCard
      key={i}
      songName={`${song.name}`}
      className={styles.songCard}
      onClick={() => {
        if (window.confirm(`Are you sure you want to load "${song.name}" song?`)) {
          dispatch(setTempo(song.tempo));
          dispatch(setTracks(song.tracks));
          dispatch(hideSongPicker());
        }
      }}
    />
  )), [dispatch, songs]);
  return (
    <div style={{ display: store.getState().studio.songPickerHidden ? 'none' : 'true' }} className={styles.wrapper}>
      <div className={styles.songs}>
        <NewSong
          onClick={() => {
            if (window.prompt('Enter the song name') !== '') {
              dispatch(setTracks([]));
              dispatch(setTempo(140));
              dispatch(showSongPicker());
            } else {
              dispatch(showNotification({ message: 'Song name cannot be empty', type: 'error' }));
            }
          }}
          className={styles.songCard}
        />
        {songCards}
        {cards}
      </div>
    </div>

  );
});

SongPicker.propTypes = {
  dispatch: PropTypes.func.isRequired,
  songs: PropTypes.array,
};

SongPicker.defaultProps = {
  songs: [],
};

SongPicker.displayName = 'SongPicker';

const mapStateToProps = ({ studio }) => ({
  studio,
  tracks: studio.tracks,
});

export default connect(mapStateToProps)(SongPicker);
