/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './ProfileBlock.module.scss';
import SubmitButton from '../SubmitButton';
import history from '../../history';
import CloudQuestion from '../../assets/cloud-question.jpg';

const ProfileBlock = memo((props) => {
  const { className, user } = props;
  const url = new URL(window.location.href);
  const username = url.searchParams.get('username');

  const goToSettings = useCallback((e) => {
    e.preventDefault();
    history.push('/settings');
  }, []);

  const goToFollow = useCallback((e) => {
    e.preventDefault();
    history.push(`/profile?username=${username}`);
  }, [username]);

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
          onSubmit={goToFollow}
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
          onSubmit={goToFollow}
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
