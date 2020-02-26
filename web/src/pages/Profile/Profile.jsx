import React, {
  memo, useEffect, useState, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import InfiniteScroll from "react-infinite-scroll-component";


const Profile = memo((props) => {
  useUpdateUserDetails();
  const { dispatch, user } = props;
  const url = new URL(window.location.href);
  const username = url.searchParams.get('username');

  const [gotSongs, setGotSongs] = useState([]);
  const [gotPosts, setGotPosts] = useState([]);
  const [gotNextSongs, setNextSongs] = useState("");
  const [gotNextPosts, setNextPosts] = useState("");

  const [loadingSongs, setLoadingSongs] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    const getSongs = async () => {
      setLoadingSongs(true);
      const res = await getCompiledSongs(username);
      setLoadingSongs(false);
      if (res.status === 200) {
        setGotSongs(res.data.songs);
        if (res.data.next_page) {
          setNextSongs(res.data.next_page)
        }
      }
    };
    getSongs();
  }, [dispatch, username]);

  const nextSongs = async() => {
    setLoadingSongs(true);
    const res = await getNextCompiledSongs(gotNextSongs);
    setLoadingSongs(false);
    if (res.status === 200) {
      setGotSongs([...gotSongs, ...res.data.songs]);
      if (res.data.next_page) {
          setNextSongs(res.data.next_page)
      } else {
        setNextSongs("")
      }
    }
  };

  const nextPosts = async() => {
    setLoadingPosts(true);
    const res = await getNextUserPosts(gotNextPosts);
    setLoadingPosts(false);
    if (res.status === 200) {
      setGotPosts([...gotPosts, ...res.data.posts]);
      if (res.data.next_page) {
          setNextPosts(res.data.next_page)
      } else {
        setNextPosts("")
      }
    }
  };

  const refreshPosts = useCallback(async () => {
    setLoadingPosts(true);
    const res = await getUserPosts(username);
    setLoadingPosts(false);
    if (res.status === 200) {
      setGotPosts(res.data.posts);
      if (res.data.next_page) {
          setNextPosts(res.data.next_page)
      }
    }
  }, [username]);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  return (
    <div className={styles.wrapper}>
      <Header selected={3} />
      {/* Songs section */}
      <div className={styles.contentWrapper}>
        <ProfileBlock />
      </div>
      <div className={styles.contentWrapper}>
        <title className={styles.sectionTitle}>Songs</title>
          <InfiniteScroll
            height={500}
            dataLength={gotSongs.length}
            next={nextSongs}
            hasMore={gotNextSongs}
            loader={loadingSongs ? <Spinner /> : null}
          >
            <div className={styles.songs}>
            {gotSongs.map((song) => (
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
            ))}
            </div>
          </InfiniteScroll>
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
            height={500}
            dataLength={gotPosts.length}
            next={nextPosts}
            hasMore={gotNextPosts}
            loader={loadingPosts ? <Spinner /> : null}
          >
            <div className={styles.blogs}>
              {gotPosts.map((post) => (
                <PostCard
                  className={styles.blogCard}
                  key={username + post[1]}
                  message={post[0]}
                  time={post[1]}
                  username={username}
                  profileImg={user.profiler}
                />
              ))}
            </div>
        </InfiniteScroll>
      </div>
    </div>
  );
});

Profile.propTypes = {
  dispatch: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

Profile.displayName = 'Profile';

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(Profile);
