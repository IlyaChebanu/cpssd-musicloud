import React, {
  memo, useEffect, useState, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './Profile.module.scss';
import Header from '../../components/Header';
import PostCard from '../../components/PostCard/PostCard';
import ProfileBlock from '../../components/ProfileBlock';
import AddPost from '../../components/AddPost';
import { useUpdateUserDetails } from '../../helpers/hooks';
import {
  getCompiledSongs, getUserPosts, getNextCompiledSongs, getNextUserPosts,
} from '../../helpers/api';
import Spinner from '../../components/Spinner';
import SongCard from '../../components/SongCard';


const Profile = memo((props) => {
  useUpdateUserDetails();
  const { user } = props;
  const url = new URL(window.location.href);
  const username = url.searchParams.get('username');

  const [gotSongs, setGotSongs] = useState([]);
  const [gotPosts, setGotPosts] = useState([]);
  const [gotNextSongs, setNextSongs] = useState('');
  const [gotNextPosts, setNextPosts] = useState('');

  useEffect(() => {
    const getSongs = async () => {
      const res = await getCompiledSongs(username);
      if (res.status === 200) {
        setGotSongs(res.data.songs);
        if (res.data.next_page) {
          setNextSongs(res.data.next_page);
        }
      }
    };
    getSongs();
  }, [username]);

  const nextSongs = useCallback(async () => {
    if (gotNextSongs) {
      const res = await getNextCompiledSongs(gotNextSongs);
      if (res.status === 200) {
        setGotSongs([...gotSongs, ...res.data.songs]);
        if (res.data.next_page) {
          setNextSongs(res.data.next_page);
        } else {
          setNextSongs('');
        }
      }
    }
  }, [gotNextSongs, gotSongs]);

  const nextPosts = useCallback(async () => {
    const res = await getNextUserPosts(gotNextPosts);
    if (res.status === 200) {
      setGotPosts([...gotPosts, ...res.data.posts]);
      if (res.data.next_page) {
        setNextPosts(res.data.next_page);
      } else {
        setNextPosts('');
      }
    }
  }, [gotNextPosts, gotPosts]);

  const refreshPosts = useCallback(async () => {
    const res = await getUserPosts(username);
    if (res.status === 200) {
      setGotPosts(res.data.posts);
      if (res.data.next_page) {
        setNextPosts(res.data.next_page);
      }
    }
  }, [username]);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const ownSongCards = useMemo(() => gotSongs.map((song) => (
    <SongCard
      key={song.sid}
      id={song.sid}
      username={song.username}
      title={song.title}
      duration={song.duration}
      url={song.url}
      cover={song.cover}
      likes={song.likes}
      profileImg={user.profiler}
    />
  )), [gotSongs, user.profiler]);

  const ownPostCards = useMemo(() => gotPosts.map((post) => (
    <PostCard
      key={username + post[1]}
      className={styles.blogCard}
      message={post[0]}
      time={post[1]}
      username={username}
      profileImg={user.profiler}
    />
  )), [gotPosts, user.profiler, username]);

  return (
    <div className={styles.wrapper}>
      <Header selected={3} />
      {/* Songs section */}
      <div className={styles.contentWrapper}>
        <ProfileBlock />
      </div>
      <div className={styles.contentWrapper}>
        <title className={styles.sectionTitle}>Songs</title>
        <div className={styles.songs}>
          {ownSongCards}
        </div>
        <p
          className={styles.seeMore}
          onClick={gotNextSongs ? nextSongs : () => {}}
        >
          See more
        </p>
      </div>

      {/* Blogs section */}

      <div className={styles.contentWrapper}>
        <title className={styles.sectionTitle}>Posts</title>
        {
          username === user.username
            ? <AddPost onSubmit={refreshPosts} placeholder={`What do you want to say ${username}?`} />
            : <div />
        }
        <InfiniteScroll
          dataLength={gotPosts.length}
          next={nextPosts}
          hasMore={gotNextPosts}
          loader={<Spinner />}
        >
          <div className={styles.blogs}>
            {ownPostCards}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
});

Profile.propTypes = {
  user: PropTypes.object.isRequired,
};

Profile.displayName = 'Profile';

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(Profile);
