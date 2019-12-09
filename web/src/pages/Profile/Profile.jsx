import React, {
  memo, useEffect, useState, useMemo, useCallback
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './Profile.module.scss';
import Header from '../../components/Header';
import PostCard from '../../components/PostCard/PostCard';
import ProfileBlock from '../../components/ProfileBlock';
import AddPost from '../../components/AddPost';
import { useUpdateUserDetails } from '../../helpers/hooks';
import {getCompiledSongs, getTimeline, getUserPosts} from '../../helpers/api';
import OwnSongCard from '../../components/OwnSongCard';
import Spinner from '../../components/Spinner';
import { hideSongPicker, setSongId, setSongName } from '../../actions/studioActions';


const Profile = memo((props) => {
  useUpdateUserDetails();
  const { dispatch, user, history } = props;
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
  }, []);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const ownSongCards = useMemo(() => gotSongs.map((song) => (
    <OwnSongCard
      key={song.sid}
      songName={`${song.title}`}
      className={styles.songCard}
      onClick={() => {
        if (username === user.username) {
          dispatch(setSongName(song.title));
          dispatch(setSongId(song.sid));
          dispatch(hideSongPicker());
          history.push('/studio');
          return true;
        }
        return false;
      }}
      imageSrc={song.cover}
    />
  )), [dispatch, gotSongs, history, user.username, username]);

  const ownPostCards = useMemo(() => gotPosts.map((post) => (
    <PostCard
      className={styles.blogCard}
      message={post[0]}
      time={post[1]}
      username={username}
    />
  )), [gotPosts, username]);

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
