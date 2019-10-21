import React from 'react';
import PropTypes from 'prop-types';
import styles from './Discover.module.scss';
import Header from '../../components/Header';
import MusicSearch from '../../components/MusicSearch';
import SongCard from '../../components/SongCard';

const songCards = [];
for (let i = 0; i < 10; i++) {
  songCards.push(<SongCard className={styles.songCard}/>);
}

const Discover = props => {
  return (
    <div className={styles.wrapper}>
      <Header selected={1}/>
      <div className={styles.contentWrapper}>
        <MusicSearch className={styles.musicSearch}/>
        <div className={styles.songs}>
          {songCards}
          <div className={styles.final}/>
        </div>
      </div>
    </div>
  );
};

Discover.propTypes = {

};

export default Discover;

