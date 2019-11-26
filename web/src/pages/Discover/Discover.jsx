import React from 'react';
import PropTypes from 'prop-types';
import styles from './Discover.module.scss';
import Header from '../../components/Header';
import MusicSearch from '../../components/MusicSearch';
import SongCard from '../../components/SongCard';
import { useUpdateUserDetails } from '../../helpers/utils';

const songCards = [];
for (let i = 0; i < 10; i++) {
  songCards.push(<SongCard key={i} className={styles.songCard}/>);
}

const Discover = props => {
  useUpdateUserDetails();

  return (
    <div className={styles.wrapper}>
      <Header selected={1}/>
      <div className={styles.contentWrapper}>
        <MusicSearch className={styles.musicSearch}/>
        <div className={styles.songs}>
          {songCards}
        </div>
      </div>
    </div>
  );
};

Discover.propTypes = {

};

export default Discover;

