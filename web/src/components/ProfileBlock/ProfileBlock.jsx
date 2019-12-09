/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './ProfileBlock.module.scss';
import SubmitButton from '../SubmitButton';
import history from '../../history';
import CloudQuestion from '../../assets/cloud-question.jpg';
import { getUserDetails, postFollow, postUnfollow } from '../../helpers/api';
import store from '../../store';
import {
  setFollowers,
  setFollowing,
  setFollowStatus,
  setLikes,
  setPosts,
  setProfiler,
  setSongs,
} from '../../actions/userActions';
import { showNotification } from '../../actions/notificationsActions';

const ProfileBlock = memo((props) => {
  const { className, user } = props;
  const url = new URL(window.location.href);
  const username = url.searchParams.get('username');

  const goToSettings = useCallback((e) => {
    e.preventDefault();
    history.push('/settings');
  }, []);

  const refreshProfile = useCallback(() => {
    getUserDetails(username).then((res) => {
      if (res.status === 200) {
        store.dispatch(setProfiler(res.data.profile_pic_url));
        store.dispatch(setFollowers(res.data.followers));
        store.dispatch(setFollowing(res.data.following));
        store.dispatch(setLikes(res.data.likes));
        store.dispatch(setPosts(res.data.posts));
        store.dispatch(setSongs(res.data.songs));
        store.dispatch(setFollowStatus(res.data.follow_status));
      } else {
        store.dispatch(showNotification({ message: 'An unknown error has occurred.' }));
      }
    });
  }, [username]);

  const follow = useCallback(async (e) => {
    e.preventDefault();
    const res = await postFollow(username);
    if (res.status === 200) {
      store.dispatch(setFollowStatus(1));
      refreshProfile();
      return true;
    }
    return false;
  }, [refreshProfile, username]);

  const unfollow = useCallback(async (e) => {
    e.preventDefault();
    const res = await postUnfollow(username);
    if (res.status === 200) {
      store.dispatch(setFollowStatus(0));
      refreshProfile();
      return true;
    }
    return false;
  }, [refreshProfile, username]);


  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.topWrapper}>
        <img
          alt="Profiler"
          className={styles.profilePicture}
          src={
          (user.profiler && user.profiler !== '') ? user.profiler : CloudQuestion
}
        />
        <div className={styles.stats}>
          <div className={styles.stat}>
            <Link to={`/profile?username=${username}`} className={styles.num}>
              {typeof user.followers === 'number' ? user.followers : '?'}
            </Link>
            <p className={styles.class}>followers</p>
          </div>
          <div className={styles.stat}>
            <Link to={`/profile?username=${username}`} className={styles.num}>
              {typeof user.following === 'number' ? user.following : '?'}
            </Link>
            <p className={styles.class}>following</p>
          </div>
          <div className={styles.stat}>
            <Link to={`/profile?username=${username}`} className={styles.num}>
              {typeof user.songs === 'number' ? user.songs : '?'}
            </Link>
            <p className={styles.class}>songs</p>
          </div>
          <div className={styles.stat}>
            <Link to={`/profile?username=${username}`} className={styles.num}>
              {typeof user.posts === 'number' ? user.posts : '?'}
            </Link>
            <p className={styles.class}>posts</p>
          </div>
          <div className={styles.stat}>
            <Link to={`/profile?username=${username}`} className={styles.num}>
              {typeof user.likes === 'number' ? user.likes : '?'}
            </Link>
            <p className={styles.class}>likes</p>
          </div>
        </div>
        <form
          className={username === user.username ? styles.followButton : styles.hide}
          onSubmit={goToSettings}
        >
          <SubmitButton className={username === user.username ? styles.followButton : styles.hide} text="Settings" />
        </form>
        <form
          className={
              username !== user.username && user.follow_status !== 1
                ? styles.followButton
                : styles.hid
          }
          onSubmit={follow}
        >
          <SubmitButton
            className={
                username !== user.username && user.follow_status !== 1
                  ? styles.followButton
                  : styles.hide
            }
            text="Follow"
          />
        </form>
        <form
          className={
              username !== user.username && user.follow_status === 1
                ? styles.followButton
                : styles.hide
          }
          onSubmit={unfollow}
        >
          <SubmitButton
            className={
                username !== user.username && user.follow_status === 1
                  ? styles.followButton
                  : styles.hide
            }
            text="Unfollow"
          />
        </form>
      </div>
      <div>
        <p className={styles.username}>{username}</p>
      </div>
    </div>
  );
});


ProfileBlock.propTypes = {
  className: PropTypes.string,
  user: PropTypes.object.isRequired,
};

ProfileBlock.defaultProps = {
  className: '',
};

ProfileBlock.displayName = 'ProfileBlock';

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(ProfileBlock);
