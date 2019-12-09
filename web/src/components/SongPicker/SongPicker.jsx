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
import { getEditableSongs, createNewSong } from '../../helpers/api';
import Spinner from '../Spinner/Spinner';

const SongPicker = memo((props) => {
  const { dispatch, songPickerHidden } = props;
  const [gotSongs, setGotSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getSongs = async () => {
      setLoading(true);
      const res = await getEditableSongs();
      setLoading(false);
      if (res.status === 200) {
        setGotSongs(res.data.songs);
      }
    };
    if (!songPickerHidden) {
      getSongs();
    }
  }, [dispatch, songPickerHidden]);

  const handleCreateNewSong = useCallback(async () => {
    const res = await createNewSong('New Song');
    if (res.status === 200) {
      dispatch(setSongId(res.data.sid));
      dispatch(setTracks([]));
      dispatch(setTempo(140));
      dispatch(setSongName('New Song'));
      dispatch(hideSongPicker());
    }
  }, [dispatch]);

  const ownSongCards = useMemo(() => gotSongs.map((song) => (
    <OwnSongCard
      key={song.sid}
      songName={`${song.title}`}
      className={styles.songCard}
      onClick={() => {
        dispatch(setSongName(song.title));
        dispatch(setSongId(song.sid));
        dispatch(hideSongPicker());
      }}
      imageSrc={song.cover}
    />
  )), [dispatch, gotSongs]);


  return (
    <div style={{ visibility: songPickerHidden ? 'hidden' : 'visible' }} className={styles.wrapper}>
      <div className={styles.songs}>
        <NewSong
          onClick={handleCreateNewSong}
          className={styles.songCard}
        />
        {loading ? <Spinner /> : ownSongCards}
      </div>
    </div>
  );
});

SongPicker.propTypes = {
  dispatch: PropTypes.func.isRequired,
  songPickerHidden: PropTypes.bool.isRequired,
};

SongPicker.displayName = 'SongPicker';

const mapStateToProps = ({ studio }) => ({
  songPickerHidden: studio.songPickerHidden,
  tracks: studio.tracks,
});

export default connect(mapStateToProps)(SongPicker);
