import React, { useEffect, useState } from 'react';
import styles from './Discover.module.scss';
import Header from '../../components/Header';
import MusicSearch from '../../components/MusicSearch';
import SongCard from '../../components/SongCard';
import { useUpdateUserDetails } from '../../helpers/hooks';
import { getCompiledSongs } from '../../helpers/api';
import Spinner from '../../components/Spinner/Spinner';

const Discover = () => {
  useUpdateUserDetails();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getCompiledSongs();
      setLoading(false);
      if (res.status === 200) {
        setSongs(res.data.songs.map((song) => (
          <SongCard
            id={song.sid}
            username={song.username}
            title={song.title}
            duration={song.duration}
            url={song.url}
            cover={song.cover}
            likes={song.likes}
            profileImg={song.profiler}
          />
        )));
      }
    })();
  }, []);

  return (
    <div className={styles.wrapper}>
      <Header selected={2} />
      <div className={styles.contentWrapper}>
        <MusicSearch className={styles.musicSearch} />
        <div className={styles.songs}>
          {loading ? <Spinner /> : songs}
        </div>
      </div>
    </div>
  );
};

Discover.displayName = 'Discover';

export default Discover;
