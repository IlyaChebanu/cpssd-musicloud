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
  const [searchText, setSearchText] = useState('');
  const [songs, setSongs] = useState([]);
  const [gotNextSongs, setNextSongs] = useState('');
  const [sortedBy, setSortedBy] = useState([]);

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

  useEffect(() => {
    (async () => {
      const res = await getCompiledSongs('', searchText, sortedBy[0], sortedBy[1]);
      if (res.status === 200) {
        setSongs([]);
        setSongs(res.data.songs);
        if (res.data.next_page) {
          setNextSongs(res.data.next_page);
        } else {
          setNextSongs('');
        }
      } else if (res.status === 401) {
        setSongs([]);
        setNextSongs('');
      }
    })();
  }, [searchText, sortedBy]);

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

  const handleChange = useCallback((text) => {
    setSearchText(text.trim());
  }, []);

  return (
    <div className={styles.wrapper}>
      <Header selected={2} />
      <div className={styles.contentWrapper}>
        <MusicSearch
          setSortedBy={setSortedBy}
          onChange={handleChange}
          className={styles.musicSearch}
        />
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
