import React, {
  useEffect, useState, useCallback, useMemo,
} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './Discover.module.scss';
import Header from '../../components/Header';
import MusicSearch from '../../components/MusicSearch';
import SongCard from '../../components/SongCard';
import { useUpdateUserDetails } from '../../helpers/hooks';
import { getCompiledSongs, getNextCompiledSongs } from '../../helpers/api';
import Spinner from '../../components/Spinner/Spinner';

const Discover = () => {
  useUpdateUserDetails();

  const [songs, setSongs] = useState([]);
  const [gotNextSongs, setNextSongs] = useState('');

  useEffect(() => {
    (async () => {
      const res = await getCompiledSongs();
      if (res.status === 200) {
        setSongs(res.data.songs);
        if (res.data.next_page) {
          setNextSongs(res.data.next_page);
        }
      }
    })();
  }, []);

  const nextSongs = useCallback(async () => {
    const res = await getNextCompiledSongs(gotNextSongs);
    if (res.status === 200) {
      setSongs([...songs, ...res.data.songs]);
      if (res.data.next_page) {
        setNextSongs(res.data.next_page);
      } else {
        setNextSongs('');
      }
    }
  }, [songs, gotNextSongs]);

  const ownSongCards = useMemo(() => songs.map((song) => (
    <SongCard
      id={song.sid}
      key={song.sid}
      username={song.username}
      title={song.title}
      duration={song.duration}
      url={song.url}
      coverImage={song.cover}
      likes={song.likes}
      profileImg={song.profiler}
    />
  )), [songs]);

  return (
    <div className={styles.wrapper}>
      <Header selected={2} />
      <div className={styles.contentWrapper}>
        <MusicSearch className={styles.musicSearch} />
        <InfiniteScroll
          dataLength={songs.length}
          next={nextSongs}
          hasMore={gotNextSongs}
          loader={<Spinner />}
        >
          <div className={styles.songs}>
            {ownSongCards}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

Discover.displayName = 'Discover';

export default Discover;
