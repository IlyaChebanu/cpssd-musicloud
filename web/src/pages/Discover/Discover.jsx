import React from 'react';
import styles from './Discover.module.scss';
import Header from '../../components/Header';
import MusicSearch from '../../components/MusicSearch';
import SongCard from '../../components/SongCard';
import { useUpdateUserDetails } from '../../helpers/hooks';

const songCards = [];
for (let i = 0; i < 10; i += 1) {
  songCards.push(<SongCard key={i} className={styles.songCard} />);
}

const Discover = () => {
  useUpdateUserDetails();

  return (
    <div className={styles.wrapper}>
      <Header selected={2} />
      <div className={styles.contentWrapper}>
        <MusicSearch className={styles.musicSearch} />
        <div className={styles.songs}>
          {songCards}
        </div>
      </div>
    </div>
  );
};

Discover.displayName = 'Discover';

export default Discover;
