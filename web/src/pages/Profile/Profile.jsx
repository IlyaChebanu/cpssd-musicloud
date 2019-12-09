import React, {
  memo, useEffect, useState, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Profile.module.scss';
import Header from '../../components/Header';
import PostCard from '../../components/PostCard/PostCard';
import ProfileBlock from '../../components/ProfileBlock';
import AddPost from '../../components/AddPost';
import { useUpdateUserDetails } from '../../helpers/hooks';
import { getCompiledSongs, getUserPosts } from '../../helpers/api';
import Spinner from '../../components/Spinner';
import SongCard from '../../components/SongCard';


const Profile = memo((props) => {
  useUpdateUserDetails();
  const { dispatch, user } = props;
  const url = new URL(window.location.href);
  const username = url.searchParams.get('username');

  const [gotSongs, setGotSongs] = useState([]);
  const [gotPosts, setGotPosts] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    const getSongs = async () => {
      setLoadingSongs(true);
      const res = await getCompiledSongs(username);
      setLoadingSongs(false);
      if (res.status === 200) {
        setGotSongs(res.data.songs);
      }
    };
    getSongs();
  }, [dispatch, username]);

  const refreshPosts = useCallback(async () => {
    setLoadingPosts(true);
    const res = await getUserPosts(username);
    setLoadingPosts(false);
    if (res.status === 200) {
      setGotPosts(res.data.posts);
    }
  }, [username]);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const ownSongCards = useMemo(() => gotSongs.map((song) => (
    <SongCard
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
          {loadingSongs ? <Spinner /> : ownSongCards}
        </div>
      </div>

      {/* Blogs section */}

      <div className={styles.contentWrapper}>
        <title className={styles.sectionTitle}>Posts</title>
        {
          username === user.username
            ? <AddPost onSubmit={refreshPosts} placeholder={`What do you want to say ${username}?`} />
            : <div />
        }
        <div className={styles.blogs}>
          {loadingPosts ? <Spinner /> : ownPostCards}
        </div>
      </div>
    </div>
  );
});

Profile.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

Profile.displayName = 'Profile';

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(Profile);
