import React, { memo, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './SongPicker.module.scss';
import OwnSongCard from '../../components/OwnSongCard'
import NewSong from '../NewSong/NewSong';
import {
  setTracks,
} from '../../actions/studioActions';
import { connect } from 'react-redux';

const songCards = [];
const pushSongs = (songs) => {
  for (let i = 1; i < 20; i += 1) {
    songCards.push(<OwnSongCard key={i} songName={"Song " + i} className={styles.songCard} />);
  }
}

// const handleAddNewTrack = useCallback(() => {
//   dispatch(setTracks([
//     ...tracks,
//     {
//       volume: 1,
//       pan: 0,
//       mute: false,
//       solo: false,
//       name: 'New track',
//       samples: [],
//     },
//   ]));
// }, [dispatch, tracks]);

const SongPicker = memo((props) => {

  
  const { dispatch, exampleSong, tracks } = props;
  
  const click = () => {
    dispatch(setTracks(exampleSong))};
  
  songCards.push(<OwnSongCard key={0} songName={"exampleSong"} className={styles.songCard} onClick={useEffect(click, [dispatch, tracks])}/>)
  pushSongs()
  return (
    <div className={styles.wrapper}>
      <div className={styles.songs}>
        <NewSong className={styles.songCard} />
        {songCards}
      </div>
    </div>
    
  );
});

SongPicker.propTypes = {
  dispatch: PropTypes.func.isRequired,
  exampleSong: PropTypes.array,
};

SongPicker.defaultProps = {
  exampleSong: [],
};

SongPicker.displayName = 'SongPicker';

const mapStateToProps = ({ studio }) => ({ studio, tracks: studio.tracks })


export default connect(mapStateToProps)(SongPicker);

