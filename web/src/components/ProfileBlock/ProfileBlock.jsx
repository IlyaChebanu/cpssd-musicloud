/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { memo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Img from 'react-image';
import styles from './ProfileBlock.module.scss';
import SubmitButton from '../SubmitButton';
import history from '../../history';
import CloudQuestion from '../../assets/cloud-question.jpg';
import {
  getUserDetails, postFollow, postUnfollow, getFollowers, getFollowing, uploadFile,
  changeProfiler,
} from '../../helpers/api';
import store from '../../store';
import {
  setFollowers, setFollowStatus, setProfilePicUrl, setProfiler, showUsersPopup,
} from '../../actions/userActions';
import { showNotification } from '../../actions/notificationsActions';
import UsersPopup from '../UsersPopup/UsersPopup';
import Spinner from '../Spinner';
import { ReactComponent as EditIcon } from '../../assets/icons/edit-sample.svg';

const ProfileBlock = memo((props) => {
  const { dispatch, className, user } = props;
  const url = new URL(window.location.href);
  const username = url.searchParams.get('username');
  const [gotUsers, setGotUsers] = useState([]);
  const [follower, setFollower] = useState(false);
  const [loading, setLoading] = useState(false);
  const goToSettings = useCallback((e) => {
    e.preventDefault();
    history.push('/settings');
  }, []);

  const getMyFollowers = useCallback(async () => {
    const res = await getFollowers(username);
    setGotUsers(res.data.followers);
    setFollower(true);
    dispatch(showUsersPopup());
  }, [dispatch, username]);

  const getMyFollowing = useCallback(async () => {
    const res = await getFollowing(username);
    setGotUsers(res.data.following);
    setFollower(false);
    dispatch(showUsersPopup());
  }, [dispatch, username]);

  const refreshProfile = useCallback(() => {
    getUserDetails(username).then((res) => {
      if (res.status === 200) {
        store.dispatch(setFollowers(res.data.followers));
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
      refreshProfile();
      return true;
    }
    return false;
  }, [refreshProfile, username]);

  const unfollow = useCallback(async (e) => {
    e.preventDefault();
    const res = await postUnfollow(username);
    if (res.status === 200) {
      refreshProfile();
      return true;
    }
    return false;
  }, [refreshProfile, username]);

  const uploadProfilerToS3 = useCallback(async (img) => {
    if (username) {
      setLoading(true);
      const res = await uploadFile('profiler', img, username);
      await changeProfiler({ url: res });
      dispatch(setProfilePicUrl(res));
      dispatch(setProfiler(res));
      setLoading(false);
    }
  }, [dispatch, username]);

  const handleCoverChange = useCallback(async () => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'image/*');
    fileSelector.click();
    fileSelector.onchange = function onChange() {
      const img = fileSelector.files[0];
      uploadProfilerToS3(img);
    };
  }, [uploadProfilerToS3]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.topWrapper}>
        <div className={styles.imgBlock}>
          {loading ? <Spinner className={styles.spinner} /> : (
              <Img
                onClick={username === user.username ? handleCoverChange : () => {}}
                className={username === user.username ? `${styles.profilePicture} ${styles.filter}` : styles.profilePicture}
                alt="Profiler"
                src={[user.profiler, CloudQuestion]}
              />
          )}
          {username === user.username ? <EditIcon /> : null}
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <p className={styles.num} style={{ cursor: 'pointer' }} onClick={getMyFollowers}>
              {typeof user.followers === 'number' ? user.followers : '?'}
            </p>
            <p className={styles.class}>followers</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.num} style={{ cursor: 'pointer' }} onClick={getMyFollowing}>
              {typeof user.following === 'number' ? user.following : '?'}
            </p>
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
                : styles.hide
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
      <UsersPopup follower={follower} users={gotUsers} />
    </div>
  );
});


ProfileBlock.propTypes = {
  dispatch: PropTypes.func.isRequired,
  className: PropTypes.string,
  user: PropTypes.object.isRequired,
};

ProfileBlock.defaultProps = {
  className: '',
};

ProfileBlock.displayName = 'ProfileBlock';

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(ProfileBlock);
